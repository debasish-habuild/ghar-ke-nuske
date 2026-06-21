// Package auth provides the dashboard's basic authentication: a single
// username/password stored in the Firestore document config/login.
//
// This is intentionally simple (one shared admin credential). The login
// endpoint validates the pair for the UI gate; the middleware re-validates on
// every mutating request via HTTP Basic Auth, so writes can't be made without
// the credential even if someone calls the API directly.
package auth

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"net/http"

	"cloud.google.com/go/firestore"
)

type credentials struct {
	Username string `firestore:"username"`
	Password string `firestore:"password"`
}

// Authenticator validates credentials against config/login.
type Authenticator struct {
	db *firestore.Client
}

// New builds an Authenticator backed by Firestore.
func New(db *firestore.Client) *Authenticator {
	return &Authenticator{db: db}
}

// valid reports whether the given username/password match config/login. Uses a
// constant-time compare to avoid leaking timing information.
func (a *Authenticator) valid(ctx context.Context, user, pass string) (bool, error) {
	doc, err := a.db.Collection("config").Doc("login").Get(ctx)
	if err != nil {
		return false, err
	}
	var c credentials
	if err := doc.DataTo(&c); err != nil {
		return false, err
	}
	userOK := subtle.ConstantTimeCompare([]byte(user), []byte(c.Username)) == 1
	passOK := subtle.ConstantTimeCompare([]byte(pass), []byte(c.Password)) == 1
	return userOK && passOK, nil
}

// LoginHandler handles POST /api/login: validates the JSON body and returns
// 200 {"ok":true} on success or 401 on failure.
func (a *Authenticator) LoginHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}
	ok, err := a.valid(r.Context(), body.Username, body.Password)
	if err != nil {
		http.Error(w, `{"error":"auth check failed"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "invalid credentials"})
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"ok": true})
}

// Middleware protects mutating routes: every request must carry valid HTTP
// Basic Auth credentials matching config/login. OPTIONS is let through for CORS
// preflight.
func (a *Authenticator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}
		user, pass, ok := r.BasicAuth()
		if !ok {
			http.Error(w, `{"error":"missing credentials"}`, http.StatusUnauthorized)
			return
		}
		valid, err := a.valid(r.Context(), user, pass)
		if err != nil {
			http.Error(w, `{"error":"auth check failed"}`, http.StatusInternalServerError)
			return
		}
		if !valid {
			http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
