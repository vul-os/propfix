package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	r "github.com/exolutionza/propfix-backend-go/internal/router"
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

	// Start the server using the router package's Start function
	r.Router()

	fmt.Println("Server is running. Press Ctrl+C to exit.")
}
