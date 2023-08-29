package router

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	jsonRpcServer "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/server"
	jsonRpcProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	firebase "firebase.google.com/go/v4"
	"github.com/exolutionza/propfix-backend-go/internal/auth"
	"github.com/exolutionza/propfix-backend-go/internal/authz"
	"github.com/exolutionza/propfix-backend-go/internal/buildings"
	"github.com/exolutionza/propfix-backend-go/internal/events"
	"github.com/exolutionza/propfix-backend-go/internal/jobs"
	"github.com/exolutionza/propfix-backend-go/internal/labels"
	"github.com/exolutionza/propfix-backend-go/internal/organizations"
	"github.com/exolutionza/propfix-backend-go/internal/permissions"
	roles "github.com/exolutionza/propfix-backend-go/internal/roles"

	"github.com/jackc/pgx/v4/pgxpool"
)

func Router() {
	pgHost := "postgresql-142310-0.cloudclusters.net"
	pgPort := "18723"
	pgDatabase := "propfix"
	pgUser := "propfixadmin"
	pgPassword := "happy123"

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

	authClient, err := app.Auth(context.Background())
	if err != nil {
		fmt.Println("Failed to initialize Firebase Auth client:", err)
		return
	}
	authorizer := authz.NewAuthz(dbpool)

	orgStore := organizations.NewOrganizationStore(dbpool)

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
				jobs.New(dbpool, authorizer),
				events.New(dbpool, authorizer),
			},
		},
		// Add more RPC server configurations for other services here
	}

	// Create a new server instance
	rpcServer := jsonRpcServer.New("localhost", "8080", rpcServerConfigs)

	// Start server using goroutine
	go func() {
		if err := rpcServer.Start(); err != nil {
			fmt.Println("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to stop
	systemSignalsChannel := make(chan os.Signal, 1)
	signal.Notify(systemSignalsChannel, os.Interrupt, syscall.SIGTERM)
	<-systemSignalsChannel

	fmt.Println("Application is shutting down..")
}
