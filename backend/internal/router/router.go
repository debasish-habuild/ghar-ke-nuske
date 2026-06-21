// Package router assembles the HTTP routes and cross-cutting middleware.
package router

import (
	"encoding/json"
	"net/http"

	"github.com/habuild/ghar-ke-nuske/backend/internal/catalog"
)

// New builds the application's http.Handler: health check, catalog routes, and
// the CORS middleware wrapping it all.
func New(catalogHandler *catalog.Handler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	catalogHandler.Register(mux)

	return withCORS(mux)
}

// withCORS allows the Expo app (and a local web build) to call the API from a
// different origin. Kept permissive for development; tighten the allowed
// origin before production.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
