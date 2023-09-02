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
	if isRunningInCloud() {
		fmt.Println("Running in a cloud environment")
	} else {
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

func isRunningInCloud() bool {
	// Check for common environment variables present in various cloud platforms
	cloudEnvVariables := []string{
		"AWS_LAMBDA_FUNCTION_NAME",
		"GOOGLE_CLOUD_PROJECT",
		"AZURE_FUNCTIONS_ENVIRONMENT",
		"HEROKU_APP_NAME",
		"IBM_CLOUD_REGION",
	}

	for _, envVar := range cloudEnvVariables {
		if os.Getenv(envVar) != "" {
			return true
		}
	}

	return false
}
