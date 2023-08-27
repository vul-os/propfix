package router

import (
	"context"
	"fmt"
	"net/http"

	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/board"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	organizations "github.com/exolutionza/propfix-backend-go/internal/organizations"
	"github.com/exolutionza/propfix-backend-go/internal/permissions"
	"github.com/exolutionza/propfix-backend-go/internal/role"
	"github.com/gorilla/mux"
	"github.com/gorilla/rpc/v2"
	"github.com/gorilla/rpc/v2/json2"
	"github.com/jackc/pgx/v4/pgxpool"
)

func Router(w http.ResponseWriter, r *http.Request) {
	// Set your PostgreSQL credentials here
	pgHost := "postgresql-141986-0.cloudclusters.net"
	pgPort := "18850"
	pgDatabase := "propfix"
	pgUser := "propfixadmin"
	pgPassword := "happy123"

	pgConnString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		pgUser, pgPassword, pgHost, pgPort, pgDatabase)

	// Create a PostgreSQL connection pool
	dbpool, err := pgxpool.Connect(context.Background(), pgConnString)
	if err != nil {
		http.Error(w, "Failed to connect to PostgreSQL", http.StatusInternalServerError)
		return
	}
	defer dbpool.Close()

	conf := &firebase.Config{
		ProjectID: "prop-fix",
	}
	app, err := firebase.NewApp(context.Background(), conf)
	if err != nil {
		http.Error(w, "Failed to initialize Firebase app", http.StatusInternalServerError)
		return
	}

	// Initialize Firebase Auth client
	authClient, err := app.Auth(context.Background())
	if err != nil {
		http.Error(w, "Failed to initialize Firebase Auth client", http.StatusInternalServerError)
		return
	}
	authorizer := authz.NewAuthz(dbpool)

	// Create an instance of the EventsStore
	eventsStore := events.NewEventsStore(dbpool)
	orgStore := organizations.NewOrganizationStore(dbpool)

	// Create a new RoleHandler instance
	roleHandler := NewRoleHandler(dbpool, authorizer)

	// Create a new RPC server
	rpcServer := rpc.NewServer()

	// Register the RoleHandler for RPC methods
	err = rpcServer.RegisterCodec(json2.NewCodec(), "application/json")
	if err != nil {
		http.Error(w, "Failed to register JSON codec", http.StatusInternalServerError)
		return
	}
	rpcServer.RegisterService(roleHandler, "Role")

	// Create a Gorilla Mux router
	router := mux.NewRouter()

	// Define the routes
	router.HandleFunc("/", helloWorld).Methods("GET")

	// Protected routes using auth middleware
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(auth.IsAuthenticated(authClient, *orgStore))

	// Create a new BoardHandler instance
	boardHandler := board.NewBoardsHandler(dbpool, authorizer)

	// Create a new BuildingsHandler instance
	buildingsHandler := buildings.NewBuildingsHandler(dbpool, authorizer)

	// Create a new ColumnsHandler instance
	columnsHandler := columns.NewColumnsHandler(dbpool, authorizer)

	// Create a new JobsHandler instance
	jobsHandler := jobs.NewJobsHandler(dbpool, eventsStore, authorizer)

	// Create a new EventsHandler instance
	eventsHandler := events.NewEventsHandler(eventsStore, authorizer)

	// Create a new LabelsHandler instance
	labelsHandler := labels.NewLabelsHandler(dbpool, authorizer)

	// Create a new OrganizationHandler instance
	organizationHandler := organizations.NewOrganizationHandler(orgStore, authorizer)

	// Create a new PermissionsHandler instance
	permissionsHandler := permissions.NewPermissionsHandler(dbpool, authorizer)


	// Apply the enableCORS middleware to all routes
	handler := EnableCORS(router)

	// Serve the HTTP requests
	handler.ServeHTTP(w, r)
}

func helloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}
