package function

import (
	"log"

	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
	"github.com/exolutionza/propfix-backend-go/internal/router"
)

func main() {
	// Use the functions framework to start the router as a Google Cloud Function
	funcframework.RegisterHTTPFunction("/", router.Router)
	if err := funcframework.Start("8080"); err != nil {
		log.Fatalf("Failed to start function: %v\n", err)
	}
}
