// Command server runs the Ghar Ke Nuskhe HTTP API backed by Firestore.
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/habuild/ghar-ke-nuske/backend/internal/auth"
	"github.com/habuild/ghar-ke-nuske/backend/internal/catalog"
	"github.com/habuild/ghar-ke-nuske/backend/internal/config"
	"github.com/habuild/ghar-ke-nuske/backend/internal/firebaseclient"
	"github.com/habuild/ghar-ke-nuske/backend/internal/router"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	// A background context for SDK setup; the HTTP server gets per-request
	// contexts from net/http.
	ctx := context.Background()

	db, closeDB, err := firebaseclient.New(ctx, cfg)
	if err != nil {
		return err
	}
	defer func() {
		if cerr := closeDB(); cerr != nil {
			log.Printf("closing firestore: %v", cerr)
		}
	}()

	// Compose the layers: repository -> service -> handler.
	repo := catalog.NewRepository(db)
	svc := catalog.NewService(repo)
	handler := catalog.NewHandler(svc)
	authn := auth.New(db)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router.New(handler, authn),
		ReadHeaderTimeout: 10 * time.Second,
	}

	// Run the server in a goroutine so main can block on shutdown signals.
	serverErr := make(chan error, 1)
	go func() {
		log.Printf("listening on :%s (project %s)", cfg.Port, cfg.ProjectID)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	// Block until we get a termination signal or the server fails outright.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		return err
	case <-stop:
		log.Println("shutting down...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
}
