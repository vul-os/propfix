// Command propfix is the whole product: one static binary that opens one
// SQLite file and serves the API and the site.
//
// There is no config file, no service dependency and no bootstrap step. That is
// the deployment story (§1) — a tablet, a laptop, an office NAS or a Raspberry
// Pi is a complete installation — and it only stays true if the binary keeps
// needing nothing but a path to write to.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/vul-os/propfix/backend/internal/api"
	"github.com/vul-os/propfix/backend/internal/repo"
	"github.com/vul-os/propfix/backend/internal/store"
)

// version is the build's version string, overridable at link time.
var version = "0.1.0"

func main() {
	var (
		dbPath  = flag.String("db", "propfix.db", "path to the SQLite database file")
		addr    = flag.String("addr", "127.0.0.1:8099", "listen address")
		demo    = flag.Bool("demo", false, "run an ephemeral in-memory instance seeded with demo data")
		origins = flag.String("origins", "", "comma-separated CORS allowlist (default: same-origin only)")
		secure  = flag.Bool("secure-cookies", false, "mark session cookies Secure (set when served over HTTPS)")
	)
	flag.Parse()

	// The default listen address is loopback, not 0.0.0.0. A fresh install
	// talks to nothing and is reachable from nothing (§11); exposing it to a
	// network is a decision someone makes explicitly.
	if err := run(*dbPath, *addr, *origins, *demo, *secure); err != nil {
		log.Fatalf("propfix: %v", err)
	}
}

func run(dbPath, addr, origins string, demo, secureCookies bool) error {
	if demo {
		// Demo data must never land in a real database. In-memory means the
		// dataset cannot outlive the process or overwrite anything on disk.
		dbPath = ":memory:"
	}

	st, err := store.Open(dbPath)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer st.Close()

	r := repo.New(st)
	if err := r.PurgeExpiredSessions(); err != nil {
		log.Printf("propfix: purge expired sessions: %v", err)
	}

	srv := api.New(r, version)
	srv.SecureCookies = secureCookies
	srv.Demo = demo
	for _, o := range strings.Split(origins, ",") {
		if o = strings.TrimSpace(o); o != "" {
			srv.AllowedOrigins = append(srv.AllowedOrigins, o)
		}
	}

	if demo {
		creds, err := seedDemo(r)
		if err != nil {
			return fmt.Errorf("seed demo: %w", err)
		}
		log.Printf("propfix: DEMO MODE — in-memory database, nothing is saved")
		log.Printf("propfix: sign in as %s / %s", creds.Email, creds.Password)
	}

	mux := http.NewServeMux()
	mux.Handle("/api/", srv.Handler())

	// The marketing/docs site is optional. A build without it simply does not
	// register the route rather than failing to start — the API is the
	// product, the site is a convenience.
	if site := newSiteHandler(); site != nil {
		mux.Handle("/site/", http.StripPrefix("/site/", site))
	} else {
		log.Printf("propfix: no site/ directory found; /site/ not served")
	}

	httpSrv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		log.Printf("propfix %s listening on http://%s", version, addr)
		if err := httpSrv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	// Graceful shutdown matters more here than in a clustered service: this
	// process is the only copy. A hard kill mid-write on a Raspberry Pi with a
	// cheap SD card is how a maintenance history gets truncated.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	select {
	case err := <-errCh:
		return err
	case <-stop:
		log.Printf("propfix: shutting down")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	return httpSrv.Shutdown(ctx)
}
