package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/exolutionza/propfix-backend-go/internal/server"
)

func main() {
	// How to run this code:
	// > go run ./propfix/main.go
	if !IsRunningOnCloudRun() {
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
	}
	// // // Main Part Here

	// Start the server using the router package's Start function
	server.Server()

	fmt.Println("Server is running. Press Ctrl+C to exit.")
}

// IsRunningOnCloudRun checks if the application is running on Google Cloud Run
func IsRunningOnCloudRun() bool {
	_, kServiceExists := os.LookupEnv("K_SERVICE")
	_, kRevisionExists := os.LookupEnv("K_REVISION")
	return kServiceExists && kRevisionExists
}
