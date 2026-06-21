// Package firebaseclient initialises the Firebase Admin SDK and exposes a
// ready-to-use Firestore client.
//
// The Admin SDK authenticates with a service-account key, which grants full
// server-side access to Firestore and bypasses client security rules. That is
// exactly what we want for a trusted backend: the mobile app talks to this
// API, and this API is the only thing that talks to Firestore directly.
package firebaseclient

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"

	"github.com/habuild/ghar-ke-nuske/backend/internal/config"
)

// New builds a Firestore client from the given configuration.
//
// When cfg.CredentialsFile is set we pass it explicitly; otherwise the SDK
// uses Application Default Credentials. The returned closer must be called on
// shutdown to flush and release the underlying gRPC connection.
func New(ctx context.Context, cfg config.Config) (*firestore.Client, func() error, error) {
	var opts []option.ClientOption
	switch {
	case cfg.CredentialsJSON != "":
		// Host-injected secret (e.g. Render env var) takes precedence.
		opts = append(opts, option.WithCredentialsJSON([]byte(cfg.CredentialsJSON)))
	case cfg.CredentialsFile != "":
		opts = append(opts, option.WithCredentialsFile(cfg.CredentialsFile))
	}

	app, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: cfg.ProjectID}, opts...)
	if err != nil {
		return nil, nil, fmt.Errorf("init firebase app: %w", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("init firestore client: %w", err)
	}

	return client, client.Close, nil
}
