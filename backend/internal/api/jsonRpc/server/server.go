package server

import (
	"fmt"
	netHttp "net/http"

	jsonRPCServiceProvider "github.com/exolutionza/propfix-backend-go/internal/api/jsonRpc/service/provider"

	"github.com/go-chi/chi"
	"github.com/gorilla/rpc/v2"
	gorillaJson "github.com/gorilla/rpc/v2/json2"
	"github.com/rs/zerolog/log"
)

type server struct {
	host             string
	port             string
	rootRouter       *chi.Mux
	serviceProviders []jsonRPCServiceProvider.Provider
}

type RPCServerConfig struct {
	Name             string
	Path             string
	Middleware       []func(netHttp.Handler) netHttp.Handler
	ServiceProviders []jsonRPCServiceProvider.Provider
}

func New(
	host string,
	port string,
	rpcServerConfigs []RPCServerConfig,
) *server {
	// create a new server
	newServer := new(server)
	newServer.host = host
	newServer.port = port

	// create chi root router and apply middleware
	newServer.rootRouter = chi.NewRouter()
	newServer.rootRouter.Use(preFlightAndCORSHandler)

	for _, rpcServerConfig := range rpcServerConfigs {
		log.Info().Msg(fmt.Sprintf(
			"Start %s RPC API Server on path %s",
			rpcServerConfig.Name,
			rpcServerConfig.Path,
		))

		// create new gorilla rpc server
		rpcServer := rpc.NewServer()
		rpcServer.RegisterCodec(gorillaJson.NewCodec(), "application/json")

		for _, serviceProvider := range rpcServerConfig.ServiceProviders {
			log.Info().Msg("registering api: " + serviceProvider.Name().String())
			if err := rpcServer.RegisterService(serviceProvider, serviceProvider.Name().String()); err != nil {
				log.Fatal().Err(err).Msg("registering failed: " + serviceProvider.Name().String())
			}
		}

		// create chi api router
		apiRouter := chi.NewRouter()

		// register middleware
		if rpcServerConfig.Middleware == nil {
			rpcServerConfig.Middleware = make([]func(netHttp.Handler) netHttp.Handler, 0)
		}
		apiRouter.Use(rpcServerConfig.Middleware...)

		// put handler function
		apiRouter.Post("/", func() netHttp.HandlerFunc { return rpcServer.ServeHTTP }())

		newServer.rootRouter.Mount(rpcServerConfig.Path, apiRouter)
	}

	return newServer
}

func (s *server) Start() error {
	log.Info().Msg("starting json rpc server: " + s.host + ":" + s.port)
	return netHttp.ListenAndServe(s.host+":"+s.port, s.rootRouter)
}

// todo: move to https://github.com/rs/cors
func preFlightAndCORSHandler(next netHttp.Handler) netHttp.Handler {
	return netHttp.HandlerFunc(func(w netHttp.ResponseWriter, r *netHttp.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Headers",
			"Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin")
		w.WriteHeader(netHttp.StatusOK)
		if r.Method == netHttp.MethodPost {
			next.ServeHTTP(w, r)
		}

	})
}
