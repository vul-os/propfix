package router

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/bigquery"
	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/handlers"
	"github.com/gorilla/mux"
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
		ProjectID: "prop-fix",
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

	fileUploadHandler, err := handlers.NewFileUploadHandler("propfix-attachments")
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
	protectedRouter.HandleFunc("/members/{id}", membersHandler.GetMember).Methods("GET")
	protectedRouter.HandleFunc("/members/{id}", membersHandler.DeleteMember).Methods("DELETE")
	protectedRouter.HandleFunc("/members", membersHandler.CreateMember).Methods("POST")
	protectedRouter.HandleFunc("/members", membersHandler.UpdateMember).Methods("PUT")

	jobsHandler := handlers.NewJobsHandler(client)
	protectedRouter.HandleFunc("/jobs/{id}", jobsHandler.GetJob).Methods("GET")
	protectedRouter.HandleFunc("/jobs/{id}", jobsHandler.DeleteJob).Methods("DELETE")
	protectedRouter.HandleFunc("/jobs", jobsHandler.CreateJob).Methods("POST")
	protectedRouter.HandleFunc("/jobs", jobsHandler.UpdateJob).Methods("PUT")

	historyHandler := handlers.NewHistoryHandler(client)
	protectedRouter.HandleFunc("/history/{id}", historyHandler.GetHistory).Methods("GET")
	protectedRouter.HandleFunc("/history", historyHandler.CreateHistory).Methods("POST")
	protectedRouter.HandleFunc("/history", historyHandler.UpdateHistory).Methods("PUT")
	protectedRouter.HandleFunc("/history/{id}", historyHandler.DeleteHistory).Methods("DELETE")

	commentsHandler := handlers.NewCommentsHandler(client)
	protectedRouter.HandleFunc("/comments/{id}", commentsHandler.GetComment).Methods("GET")
	protectedRouter.HandleFunc("/comments", commentsHandler.CreateComment).Methods("POST")
	protectedRouter.HandleFunc("/comments", commentsHandler.UpdateComment).Methods("PUT")
	protectedRouter.HandleFunc("/comments/{id}", commentsHandler.DeleteComment).Methods("DELETE")

	buildingsHandler := handlers.NewBuildingsHandler(client)
	protectedRouter.HandleFunc("/buildings/{id}", buildingsHandler.GetBuilding).Methods("GET")
	protectedRouter.HandleFunc("/buildings", buildingsHandler.CreateBuilding).Methods("POST")
	protectedRouter.HandleFunc("/buildings", buildingsHandler.UpdateBuilding).Methods("PUT")
	protectedRouter.HandleFunc("/buildings/{id}", buildingsHandler.DeleteBuilding).Methods("DELETE")

	columnsHandler := handlers.NewColumnsHandler(client)
	protectedRouter.HandleFunc("/columns/move-job", columnsHandler.MoveJob).Methods("POST")

	protectedRouter.HandleFunc("/file/{jobid}/{filename}", fileUploadHandler.GetFile).Methods("GET")
	protectedRouter.HandleFunc("/file/{jobid}/{filename}", fileUploadHandler.UploadFile).Methods("POST")

	// Add the route for GetBoard
	boardHandler := handlers.NewBoardHandler(client)
	protectedRouter.HandleFunc("/board", boardHandler.GetBoard).Methods("GET")

	// Apply the enableCORS middleware to all routes
	handler := EnableCORS(router)

	// Serve the HTTP requests
	handler.ServeHTTP(w, r)
}

// helloWorld writes "Hello, World!" to the HTTP response.
func helloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}
