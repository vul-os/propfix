package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"cloud.google.com/go/storage"
	internalCors "github.com/exolutionza/propfix-backend-go/internal/api/cors"
	jsonRpcServer "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/server"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"
	"github.com/exolutionza/propfix-backend-go/internal/board"
	"github.com/exolutionza/propfix-backend-go/internal/columnJobLinks"

	"github.com/exolutionza/propfix-backend-go/internal/attachments"
	"github.com/go-chi/chi"

	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/columns"
	"github.com/exolutionza/propfix-backend-go/internal/dashboard"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/inspectionItems"
	"github.com/exolutionza/propfix-backend-go/internal/inspectionTemplateItems"
	"github.com/exolutionza/propfix-backend-go/internal/inspectionTemplates"
	"github.com/exolutionza/propfix-backend-go/internal/inspections"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	"github.com/exolutionza/propfix-backend-go/internal/organizations"
	"github.com/exolutionza/propfix-backend-go/internal/pendingMembers"
	"github.com/exolutionza/propfix-backend-go/internal/permissions"
	"github.com/exolutionza/propfix-backend-go/internal/roles"

	"github.com/exolutionza/propfix-backend-go/internal/mail"

	"github.com/jackc/pgx/v4/pgxpool"
)

func Server() {
	bucketName := "propfix-attachments"
	serverAddress := "0.0.0.0"
	serverPort := "8080"

	sendEmailAddress := "Spha <noreply@mail.propfix.co>"
	mailgunApiKey := "***REMOVED-MAILGUN-API-KEY***"
	mailgunDomain := "mail.propfix.co"
	frontendUrl := "propfix.co"

	// neon.tech
	connStr := "user=exolutiontech password=***REMOVED-DB-PASSWORD*** dbname=neondb host=ep-autumn-math-44120355.us-east-2.aws.neon.tech sslmode=verify-full"
	dbpool, err := pgxpool.Connect(context.Background(), connStr)
	if err != nil {
		fmt.Println("Failed to connect to PostgreSQL:", err)
		return
	}
	defer dbpool.Close()

	mgClient := mail.NewMailgunClient(mailgunDomain, sendEmailAddress, mailgunApiKey, frontendUrl)

	conf := &firebase.Config{
		ProjectID: "propfix",
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
	columnJobLinksStore := columnJobLinks.NewColumnJobLinkStore(dbpool)
	eventStore := events.NewEventsStore(dbpool)
	labelStore := labels.NewLabelStore(dbpool)
	buildingsStore := buildings.NewBuildingsStore(dbpool)
	jobsStore := jobs.NewJobStore(dbpool)
	roleStore := roles.NewRoleStore(dbpool)
	inspectionTemplateItemsStore := inspectionTemplateItems.NewInspectionTemplateItemsStore(dbpool)
	inspectionTemplatesStore := inspectionTemplates.NewInspectionTemplatesStore(dbpool)
	inspectionsStore := inspections.NewInspectionsStore(dbpool)
	inspectionItemsStore := inspectionItems.NewInspectionItemsStore(dbpool)
	pendingMembersStore := pendingMembers.NewPendingMemberStore(dbpool)

	rpcServerConfigs := []jsonRpcServer.RPCServerConfig{
		{
			Name:             "Public",
			Path:             "/public",
			Middleware:       []func(http.Handler) http.Handler{},
			ServiceProviders: []jsonRpcProvider.Provider{},
		},
		{
			Name: "Authorized",
			Path: "/authenticated",
			Middleware: []func(http.Handler) http.Handler{
				auth.IsAuthenticated(authClient, *orgStore),
			},
			ServiceProviders: []jsonRpcProvider.Provider{
				roles.New(roleStore, authorizer),
				organizations.New(orgStore, pendingMembersStore, roleStore, authorizer, authClient, mgClient),
				permissions.New(dbpool, authorizer),
				buildings.New(buildingsStore, authorizer),
				labels.New(labelStore, authorizer),
				jobs.New(jobsStore, eventStore, authorizer, columnJobLinksStore),
				events.New(authorizer, eventStore),
				columns.New(dbpool, authorizer, columnStore),
				columnJobLinks.New(columnJobLinksStore, authorizer),
				board.New(jobsStore, authorizer, authClient, columnJobLinksStore, labelStore, buildingsStore),
				dashboard.New(dbpool, authorizer),
				inspectionTemplateItems.New(inspectionTemplateItemsStore, authorizer),
				inspectionTemplates.New(inspectionTemplatesStore, authorizer),
				inspections.New(inspectionsStore, authorizer),
				inspectionItems.New(inspectionItemsStore, authorizer),
			},
		},
		// Add more RPC server configurations for other services here
	}
	// Create a chi router for the main application
	mainRouter := internalCors.SetupCORS()

	// Create an authenticated subrouter for file uploads
	authenticatedRouter := chi.NewRouter()
	authenticatedRouter.Use(auth.IsAuthenticated(authClient, *orgStore)) // Apply auth middleware

	// Create file upload handler
	fileUploadHandler, _ := attachments.NewFileUploadHandler(bucket, eventStore) // Use your event store

	// Attach file upload routes to authenticated subrouter
	authenticatedRouter.Post("/upload/{jobid}", fileUploadHandler.UploadFile)
	authenticatedRouter.Get("/download/{jobid}/{filename}", fileUploadHandler.GetFile)
	authenticatedRouter.Delete("/delete/{jobid}/{filename}", fileUploadHandler.DeleteFile)

	// Mount the authenticated subrouter onto the main router
	mainRouter.Mount("/attachments", authenticatedRouter)

	// Pass the sub-router to the JSON-RPC server
	rpcServer := jsonRpcServer.New(serverAddress, serverPort, rpcServerConfigs)

	mainRouter.Mount("/api", rpcServer.RootRouter)
	// Mount the API sub-router to the main router
	// Start server using goroutine
	go func() {
		if err := http.ListenAndServe(rpcServer.Host+":"+rpcServer.Port, mainRouter); err != nil {
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
