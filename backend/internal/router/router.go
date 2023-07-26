package router

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/exolutionza/propfix-backend-go/internal/bi"
	"github.com/gorilla/mux"

	"github.com/exolutionza/propfix-backend-go/internal/auth"
	firebase "firebase.google.com/go/v4"
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

	// Create a BigQuery processor
	processor := bi.NewBigQueryProcessor(client)

	bqClient, err := bigquery.NewClient(context.Background(), projectID)
	if err != nil {
		panic(err)
	}

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

	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(auth.IsAuthenticated(authClient))

	protectedRouter.HandleFunc("/execute",
		processor.TemplateAndExecuteOne).Methods("POST")

	// Apply the enableCORS middleware to all routes
	handler := EnableCORS(router)

	// Serve the HTTP requests
	handler.ServeHTTP(w, r)
}

// helloWorld writes "Hello, World!" to the HTTP response.
func helloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}
