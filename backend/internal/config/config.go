// Package config loads runtime configuration from the environment.
//
// Everything the server needs to boot is read once here so the rest of the
// code can depend on a plain struct instead of reaching into os.Getenv.
package config

import (
	"fmt"
	"os"
)

// Config holds the resolved runtime configuration.
type Config struct {
	// Port is the TCP port the HTTP server listens on.
	Port string

	// ProjectID is the Firebase / GCP project that owns the Firestore database.
	ProjectID string

	// CredentialsFile is the absolute path to the service-account JSON key.
	//
	// When empty, the Firebase Admin SDK falls back to Application Default
	// Credentials (the GOOGLE_APPLICATION_CREDENTIALS env var, or the gcloud
	// ADC file). Setting it explicitly keeps behaviour predictable across
	// machines.
	CredentialsFile string
}

// Load reads configuration from the environment and validates it.
func Load() (Config, error) {
	cfg := Config{
		Port:            getEnv("PORT", "8080"),
		ProjectID:       os.Getenv("FIREBASE_PROJECT_ID"),
		CredentialsFile: os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"),
	}

	if cfg.ProjectID == "" {
		return Config{}, fmt.Errorf("FIREBASE_PROJECT_ID is required")
	}

	return cfg, nil
}

// getEnv returns the value of key, or fallback when the var is unset/empty.
func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
