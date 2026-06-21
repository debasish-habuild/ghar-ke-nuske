package catalog

import (
	"context"
	"errors"
	"fmt"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Firestore layout. Single source of truth for collection/document names.
const (
	remediesCollection    = "remedies"
	categoriesCollection  = "categories"
	ingredientsCollection = "ingredients"
	configCollection      = "config"
	appConfigDoc          = "app"
)

// ErrNotFound is returned when a requested document does not exist.
var ErrNotFound = errors.New("not found")

// Repository reads catalog data from Firestore. It is the only layer aware of
// Firestore; everything above it works with plain structs.
type Repository struct {
	db *firestore.Client
}

// NewRepository wires a repository to a Firestore client.
func NewRepository(db *firestore.Client) *Repository {
	return &Repository{db: db}
}

// ListRemedies returns every remedy.
func (r *Repository) ListRemedies(ctx context.Context) ([]Remedy, error) {
	iter := r.db.Collection(remediesCollection).Documents(ctx)
	var out []Remedy
	for {
		doc, err := iter.Next()
		if errors.Is(err, iterator.Done) {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("list remedies: %w", err)
		}
		var rem Remedy
		if err := doc.DataTo(&rem); err != nil {
			return nil, fmt.Errorf("decode remedy %s: %w", doc.Ref.ID, err)
		}
		rem.ID = doc.Ref.ID
		out = append(out, rem)
	}
	return out, nil
}

// GetRemedy returns a single remedy by id, or ErrNotFound.
func (r *Repository) GetRemedy(ctx context.Context, id string) (Remedy, error) {
	doc, err := r.db.Collection(remediesCollection).Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return Remedy{}, ErrNotFound
		}
		return Remedy{}, fmt.Errorf("get remedy %s: %w", id, err)
	}
	var rem Remedy
	if err := doc.DataTo(&rem); err != nil {
		return Remedy{}, fmt.Errorf("decode remedy %s: %w", id, err)
	}
	rem.ID = doc.Ref.ID
	return rem, nil
}

// ListCategories returns every category.
func (r *Repository) ListCategories(ctx context.Context) ([]Category, error) {
	docs, err := r.db.Collection(categoriesCollection).Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("list categories: %w", err)
	}
	out := make([]Category, 0, len(docs))
	for _, doc := range docs {
		var cat Category
		if err := doc.DataTo(&cat); err != nil {
			return nil, fmt.Errorf("decode category %s: %w", doc.Ref.ID, err)
		}
		cat.ID = doc.Ref.ID
		out = append(out, cat)
	}
	return out, nil
}

// ListIngredients returns every ingredient.
func (r *Repository) ListIngredients(ctx context.Context) ([]Ingredient, error) {
	docs, err := r.db.Collection(ingredientsCollection).Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("list ingredients: %w", err)
	}
	out := make([]Ingredient, 0, len(docs))
	for _, doc := range docs {
		var ing Ingredient
		if err := doc.DataTo(&ing); err != nil {
			return nil, fmt.Errorf("decode ingredient %s: %w", doc.Ref.ID, err)
		}
		ing.ID = doc.Ref.ID
		out = append(out, ing)
	}
	return out, nil
}

// GetAppConfig returns the config/app document, or ErrNotFound.
func (r *Repository) GetAppConfig(ctx context.Context) (AppConfig, error) {
	doc, err := r.db.Collection(configCollection).Doc(appConfigDoc).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return AppConfig{}, ErrNotFound
		}
		return AppConfig{}, fmt.Errorf("get app config: %w", err)
	}
	var cfg AppConfig
	if err := doc.DataTo(&cfg); err != nil {
		return AppConfig{}, fmt.Errorf("decode app config: %w", err)
	}
	return cfg, nil
}
