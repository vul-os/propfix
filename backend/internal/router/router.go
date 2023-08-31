package router

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"cloud.google.com/go/storage"
	jsonRpcServer "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/server"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/attachments"
	"github.com/gorilla/mux"

	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	"github.com/exolutionza/propfix-backend-go/internal/organizations"
	"github.com/exolutionza/propfix-backend-go/internal/permissions"

	roles "github.com/exolutionza/propfix-backend-go/internal/roles"

	"github.com/jackc/pgx/v4/pgxpool"
)

func Router() {
	pgHost := "postgresql-141986-0.cloudclusters.net"
	pgPort := "18850"
	pgDatabase := "propfix"
	pgUser := "propfixadmin"
	pgPassword := "happy123"

	bucketName := "propfix-attachments"
	serverAddress := "localhost"
	serverPort := "8080"
	attachmentPort := "8081"

	pgConnString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		pgUser, pgPassword, pgHost, pgPort, pgDatabase)

	dbpool, err := pgxpool.Connect(context.Background(), pgConnString)
	if err != nil {
		fmt.Println("Failed to connect to PostgreSQL:", err)
		return
	}
	defer dbpool.Close()

	conf := &firebase.Config{
		ProjectID: "prop-fix",
	}
	app, err := firebase.NewApp(context.Background(), conf)
	if err != nil {
		fmt.Println("Failed to initialize Firebase app:", err)
		return
	}
	ctx := context.Background()
	storageClient, err := storage.NewClient(ctx)
	if err != nil {
		fmt.Println("Failed to initialize google storage", err)
		return
	}
	bucket := storageClient.Bucket(bucketName)

	authClient, err := app.Auth(context.Background())
	if err != nil {
		fmt.Println("Failed to initialize Firebase Auth client:", err)
		return
	}
	authorizer := authz.NewAuthz(dbpool)

	orgStore := organizations.NewOrganizationStore(dbpool)
	columnStore := columns.NewColumnsStore(dbpool)
	eventStore := events.NewEventsStore(dbpool)

	rpcServerConfigs := []jsonRpcServer.RPCServerConfig{
		{
			Name: "Authorized",
			Path: "/api/authenticated",
			Middleware: []func(http.Handler) http.Handler{
				auth.IsAuthenticated(authClient, *orgStore),
			},
			ServiceProviders: []jsonRpcProvider.Provider{
				roles.New(dbpool, authorizer),
				organizations.New(dbpool, authorizer),
				permissions.New(dbpool, authorizer),
				buildings.New(dbpool, authorizer),
				labels.New(dbpool, authorizer),
				jobs.New(dbpool, authorizer, columnStore),
				events.New(authorizer, eventStore),
				columns.New(dbpool, authorizer, columnStore),
			},
		},
		// Add more RPC server configurations for other services here
	}

	// Create a new server instance
	rpcServer := jsonRpcServer.New(serverAddress, serverPort, rpcServerConfigs)

	// Start server using goroutine
	go func() {
		if err := rpcServer.Start(); err != nil {
			fmt.Println("Failed to start server:", err)
		}
	}()

	// File upload server
	fileUploadHandler, _ := attachments.NewFileUploadHandler(bucket, eventStore) // Use your event store

	router := mux.NewRouter()
	authenticatedRouter := router.PathPrefix("/attachments").Subrouter()
	authenticatedRouter.Use(auth.IsAuthenticated(authClient, *orgStore)) // Apply auth middleware to authenticated routes

	authenticatedRouter.HandleFunc("/upload/{jobid}", fileUploadHandler.UploadFile).Methods("POST")
	authenticatedRouter.HandleFunc("/download/{jobid}/{filename}", fileUploadHandler.GetFile).Methods("GET")
	authenticatedRouter.HandleFunc("/delete/{jobid}/{filename}", fileUploadHandler.DeleteFile).Methods("DELETE")

	// Create an HTTP server with the router as the handler
	httpServer := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", serverAddress, attachmentPort), // Replace with your desired address and port
		Handler: router,
	}
	// Start the server using a goroutine
	go func() {
		if err := httpServer.ListenAndServe(); err != nil {
			fmt.Println("Failed to start server:", err)
		}
	}()

	// Add more routes as needed
	// Wait for interrupt signal to stop
	systemSignalsChannel := make(chan os.Signal, 1)
	signal.Notify(systemSignalsChannel, os.Interrupt, syscall.SIGTERM)
	<-systemSignalsChannel

	fmt.Println("Application is shutting down..")
}
