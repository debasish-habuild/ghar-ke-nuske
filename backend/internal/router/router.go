// Package router assembles the HTTP routes and cross-cutting middleware.
package router

import (
	"encoding/json"
	"net/http"

	"github.com/habuild/ghar-ke-nuske/backend/internal/auth"
	"github.com/habuild/ghar-ke-nuske/backend/internal/catalog"
	"github.com/habuild/ghar-ke-nuske/backend/internal/upload"
)

// New builds the application's http.Handler: health check, public read routes,
// the login endpoint, and auth-protected write routes — all wrapped in CORS.
func New(catalogHandler *catalog.Handler, uploader *upload.Handler, authn *auth.Authenticator) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Public reads (consumed by the mobile app).
	catalogHandler.Register(mux)

	// Dashboard login (validates against config/login).
	mux.HandleFunc("POST /api/login", authn.LoginHandler)

	// Mutations — each wrapped with Basic-Auth middleware.
	catalogHandler.RegisterWrite(mux, authn.Middleware)

	// Image-upload proxy — auth-protected. Receives the file and PUTs it to S3
	// server-side, so the file-service token never reaches the dashboard bundle
	// and there is no browser→S3 request (hence no S3-bucket CORS to manage).
	mux.Handle("POST /api/upload", authn.Middleware(http.HandlerFunc(uploader.Upload)))

	return withCORS(mux)
}

// withCORS allows the dashboard (and the Expo app) to call the API cross-origin.
// Permissive for development; tighten the allowed origin before production.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
