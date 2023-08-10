package router

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/bigquery"
	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/attachments"
	auth "github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/board"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	"github.com/exolutionza/propfix-backend-go/internal/permissions"
	"github.com/exolutionza/propfix-backend-go/internal/role"

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
	authorizer := authz.NewAuthz(client)

	// Create an instance of the EventsStore
	eventsStore := events.NewEventsStore(client)

	// Create the file upload handler
	fileUploadHandler, err := attachments.NewFileUploadHandler("propfix-attachments", eventsStore)
	if err != nil {
		log.Fatalf("Failed to initialize File Upload Handler: %v", err)
	}

	// Create a Gorilla Mux router
	router := mux.NewRouter()

	// Define the routes
	router.HandleFunc("/", helloWorld).Methods("GET")

	// Protected routes using auth middleware
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(auth.IsAuthenticated(authClient))

	// Add routes from the attachments package handlers
	protectedRouter.HandleFunc("/file/{jobid}/{filename}", fileUploadHandler.GetFile).Methods("GET")
	protectedRouter.HandleFunc("/file/{jobid}/{filename}", fileUploadHandler.DeleteFile).Methods("DELETE")
	protectedRouter.HandleFunc("/file/{jobid}", fileUploadHandler.UploadFile).Methods("POST")

	// Add routes from the board package handlers
	boardHandler := board.NewBoardHandler(client, authClient, authorizer)
	protectedRouter.HandleFunc("/board", boardHandler.GetBoard).Methods("GET")

	// Add routes from the buildings package handlers
	buildingsHandler := buildings.NewBuildingsHandler(client, authorizer)
	protectedRouter.HandleFunc("/buildings/{id}", buildingsHandler.GetBuilding).Methods("GET")
	protectedRouter.HandleFunc("/buildings", buildingsHandler.CreateBuilding).Methods("POST")
	protectedRouter.HandleFunc("/buildings", buildingsHandler.UpdateBuilding).Methods("PUT")
	protectedRouter.HandleFunc("/buildings/{id}", buildingsHandler.DeleteBuilding).Methods("DELETE")

	// Add routes from the columns package handlers
	columnsHandler := columns.NewColumnsHandler(client, authorizer)
	protectedRouter.HandleFunc("/columns", columnsHandler.GetAllColumns).Methods("GET")
	protectedRouter.HandleFunc("/columns/{id}", columnsHandler.GetColumn).Methods("GET")
	protectedRouter.HandleFunc("/columns", columnsHandler.CreateColumn).Methods("POST")
	protectedRouter.HandleFunc("/columns/{id}", columnsHandler.UpdateColumn).Methods("PUT")
	protectedRouter.HandleFunc("/columns/{id}", columnsHandler.DeleteColumn).Methods("DELETE")
	protectedRouter.HandleFunc("/movejob", columnsHandler.MoveJob).Methods("POST")

	// Add routes from the jobs package handlers
	jobsHandler := jobs.NewJobsHandler(client, eventsStore, authorizer)
	protectedRouter.HandleFunc("/jobs", jobsHandler.GetAllJobs).Methods("GET")
	protectedRouter.HandleFunc("/jobs/{id}", jobsHandler.GetJob).Methods("GET")
	protectedRouter.HandleFunc("/jobs/{id}", jobsHandler.DeleteJob).Methods("DELETE")
	protectedRouter.HandleFunc("/jobs", jobsHandler.CreateJob).Methods("POST")
	protectedRouter.HandleFunc("/jobs", jobsHandler.UpdateJob).Methods("PUT")

	// Add routes from the events package handlers
	eventsHandler := events.NewEventsHandler(eventsStore, authorizer)
	protectedRouter.HandleFunc("/events/{id}", eventsHandler.GetEvent).Methods("GET")
	protectedRouter.HandleFunc("/events", eventsHandler.CreateEvent).Methods("POST")
	protectedRouter.HandleFunc("/events", eventsHandler.UpdateEvent).Methods("PUT")
	protectedRouter.HandleFunc("/events/{id}", eventsHandler.DeleteEvent).Methods("DELETE")

	// Add routes for labels
	labelsHandler := labels.NewLabelsHandler(client)
	protectedRouter.HandleFunc("/labels", labelsHandler.GetLabel).Methods("GET")
	protectedRouter.HandleFunc("/labels/{id}", labelsHandler.GetLabel).Methods("GET")
	protectedRouter.HandleFunc("/labels", labelsHandler.CreateLabel).Methods("POST")
	protectedRouter.HandleFunc("/labels/{id}", labelsHandler.UpdateLabel).Methods("PUT")
	protectedRouter.HandleFunc("/labels/{id}", labelsHandler.DeleteLabel).Methods("DELETE")

	// Add routes for permissions
	permissionsHandler := permissions.NewPermissionsHandler(client, authorizer)
	protectedRouter.HandleFunc("/permissions", permissionsHandler.GetPermission).Methods("GET")
	protectedRouter.HandleFunc("/permissions/{id}", permissionsHandler.GetPermission).Methods("GET")
	protectedRouter.HandleFunc("/permissions", permissionsHandler.CreatePermission).Methods("POST")
	protectedRouter.HandleFunc("/permissions/{id}", permissionsHandler.UpdatePermission).Methods("PUT")
	protectedRouter.HandleFunc("/permissions/{id}", permissionsHandler.DeletePermission).Methods("DELETE")

	// Add routes for rolesS
	rolesHandler := role.NewRoleHandler(client, authorizer)
	protectedRouter.HandleFunc("/roles", rolesHandler.GetRole).Methods("GET")
	protectedRouter.HandleFunc("/roles/{id}", rolesHandler.GetRole).Methods("GET")
	protectedRouter.HandleFunc("/roles", rolesHandler.CreateRole).Methods("POST")
	protectedRouter.HandleFunc("/roles/{id}", rolesHandler.UpdateRole).Methods("PUT")
	protectedRouter.HandleFunc("/roles/{id}", rolesHandler.DeleteRole).Methods("DELETE")

	// Apply the enableCORS middleware to all routes
	handler := EnableCORS(router)

	// Serve the HTTP requests
	handler.ServeHTTP(w, r)
}

// helloWorld writes "Hello, World!" to the HTTP response.
func helloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}
