package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	r "github.com/exolutionza/propfix-backend-go/internal/router"
	"github.com/gorilla/mux"
)

func main() {
	// How to run this code:
	// > go run ./cmd/main.go

	// // // Set up local Environment

	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get current working directory: %v", err)
	}

	// Define the relative path to the keyfile
	keyfilePath := "keyfile.json"

	// Construct the absolute file path
	absolutePath := filepath.Join(cwd, keyfilePath)

	// Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
	err = os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", absolutePath)
	if err != nil {
		log.Fatalf("Failed to set GOOGLE_APPLICATION_CREDENTIALS: %v", err)
	}

	// // // Main Part Here

	// Create a new router
	router := mux.NewRouter()

	// Handle requests using the Router function
	router.PathPrefix("/").HandlerFunc(r.Router)

	// Start the server
	fmt.Println("Server listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}