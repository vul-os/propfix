// router.go

package router

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/bigquery"

	"github.com/gorilla/mux"

	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/auth"

	// Import your custom handlers package that contains CRUD operations for each table
	"github.com/exolutionza/propfix-backend-go/internal/handlers"
)

func Router(w http.ResponseWriter, r *http.Request) {
	projectID := "propfix"

	// Create a BigQuery client
	ctx := context.Background()

	client, err := bigquery.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create BigQuery client: %v", err)
	}
	defer client.Close()

	conf := &firebase.Config{
		ProjectID: projectID,
	}
	app, err := firebase.NewApp(context.Background(), conf)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase app: %v", err)
	}

	// Initialize Firebase Auth client
	authClient, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize Firebase Auth client: %v", err)
	}

	// Create a Gorilla Mux router
	router := mux.NewRouter()

	// Define the routes
	router.HandleFunc("/", helloWorld).Methods("GET")

	// Protected routes using auth middleware
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(auth.IsAuthenticated(authClient))

	// Initialize and register the handlers for each table
	membersHandler := handlers.NewMembersHandler(client)
	router.HandleFunc("/members/{id}", membersHandler.GetMember).Methods("GET")
	router.HandleFunc("/members/create", membersHandler.CreateMember).Methods("POST")
	router.HandleFunc("/members/update", membersHandler.UpdateMember).Methods("POST") // Use POST for update
	router.HandleFunc("/members/delete", membersHandler.DeleteMember).Methods("POST") // Use POST for delete

	jobsHandler := handlers.NewJobsHandler(client)
	router.HandleFunc("/jobs/{id}", jobsHandler.GetJob).Methods("GET")
	router.HandleFunc("/jobs/create", jobsHandler.CreateJob).Methods("POST")
	router.HandleFunc("/jobs/update", jobsHandler.UpdateJob).Methods("POST") // Use POST for update
	router.HandleFunc("/jobs/delete", jobsHandler.DeleteJob).Methods("POST") // Use POST for delete

	historyHandler := handlers.NewHistoryHandler(client)
	router.HandleFunc("/history/{id}", historyHandler.GetHistory).Methods("GET")
	router.HandleFunc("/history/create", historyHandler.CreateHistory).Methods("POST")
	router.HandleFunc("/history/update", historyHandler.UpdateHistory).Methods("POST") // Use POST for update
	router.HandleFunc("/history/delete", historyHandler.DeleteHistory).Methods("POST") // Use POST for delete

	commentsHandler := handlers.NewCommentsHandler(client)
	router.HandleFunc("/comments/{id}", commentsHandler.GetComment).Methods("GET")
	router.HandleFunc("/comments/create", commentsHandler.CreateComment).Methods("POST")
	router.HandleFunc("/comments/update", commentsHandler.UpdateComment).Methods("POST") // Use POST for update
	router.HandleFunc("/comments/delete", commentsHandler.DeleteComment).Methods("POST") // Use POST for delete

	buildingsHandler := handlers.NewBuildingsHandler(client)
	router.HandleFunc("/buildings/{id}", buildingsHandler.GetBuilding).Methods("GET")
	router.HandleFunc("/buildings/create", buildingsHandler.CreateBuilding).Methods("POST")
	router.HandleFunc("/buildings/update", buildingsHandler.UpdateBuilding).Methods("POST") // Use POST for update
	router.HandleFunc("/buildings/delete", buildingsHandler.DeleteBuilding).Methods("POST") // Use POST for delete

	// Apply the enableCORS middleware to all routes
	handler := EnableCORS(router)

	// Serve the HTTP requests
	handler.ServeHTTP(w, r)
}

// helloWorld writes "Hello, World!" to the HTTP response.
func helloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}
