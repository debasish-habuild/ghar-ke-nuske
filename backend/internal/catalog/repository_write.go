package catalog

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
)

var slugNonAlnum = regexp.MustCompile(`[^a-z0-9]+`)

// slugify turns a title into a stable, url-safe document id.
func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = slugNonAlnum.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

// ── Remedies ──────────────────────────────────────────────────────────────

// SaveRemedy creates or updates a remedy. If id is empty, one is derived from
// the title. createdAt is preserved on update; updatedAt is always bumped.
// Returns the id written.
func (r *Repository) SaveRemedy(ctx context.Context, id string, rem Remedy) (string, error) {
	if id == "" {
		id = slugify(rem.Title)
	}
	if id == "" {
		return "", fmt.Errorf("remedy needs an id or a title")
	}
	ref := r.db.Collection(remediesCollection).Doc(id)

	now := time.Now().UTC()
	rem.UpdatedAt = now
	rem.CreatedAt = now
	// Preserve original createdAt if the doc already exists.
	if snap, err := ref.Get(ctx); err == nil {
		if existing, ok := snap.Data()["createdAt"].(time.Time); ok {
			rem.CreatedAt = existing
		}
	}
	rem.ID = "" // never persist id as a field
	if _, err := ref.Set(ctx, rem); err != nil {
		return "", fmt.Errorf("save remedy %s: %w", id, err)
	}
	return id, nil
}

// DeleteRemedy removes a remedy by id.
func (r *Repository) DeleteRemedy(ctx context.Context, id string) error {
	if _, err := r.db.Collection(remediesCollection).Doc(id).Delete(ctx); err != nil {
		return fmt.Errorf("delete remedy %s: %w", id, err)
	}
	return nil
}

// ── Categories ────────────────────────────────────────────────────────────

// SaveCategory creates or updates a category (id derived from name if empty).
func (r *Repository) SaveCategory(ctx context.Context, id string, cat Category) (string, error) {
	if id == "" {
		id = slugify(cat.Name)
	}
	if id == "" {
		return "", fmt.Errorf("category needs an id or a name")
	}
	cat.ID = ""
	if _, err := r.db.Collection(categoriesCollection).Doc(id).Set(ctx, cat); err != nil {
		return "", fmt.Errorf("save category %s: %w", id, err)
	}
	return id, nil
}

// DeleteCategory removes a category by id.
func (r *Repository) DeleteCategory(ctx context.Context, id string) error {
	if _, err := r.db.Collection(categoriesCollection).Doc(id).Delete(ctx); err != nil {
		return fmt.Errorf("delete category %s: %w", id, err)
	}
	return nil
}

// ── Ingredients ───────────────────────────────────────────────────────────

// SaveIngredient creates or updates an ingredient (id derived from name).
func (r *Repository) SaveIngredient(ctx context.Context, id string, ing Ingredient) (string, error) {
	if id == "" {
		id = slugify(ing.Name)
	}
	if id == "" {
		return "", fmt.Errorf("ingredient needs an id or a name")
	}
	ing.ID = ""
	if _, err := r.db.Collection(ingredientsCollection).Doc(id).Set(ctx, ing); err != nil {
		return "", fmt.Errorf("save ingredient %s: %w", id, err)
	}
	return id, nil
}

// DeleteIngredient removes an ingredient by id.
func (r *Repository) DeleteIngredient(ctx context.Context, id string) error {
	if _, err := r.db.Collection(ingredientsCollection).Doc(id).Delete(ctx); err != nil {
		return fmt.Errorf("delete ingredient %s: %w", id, err)
	}
	return nil
}

// ── Config ────────────────────────────────────────────────────────────────

// SaveAppConfig overwrites the config/app document.
func (r *Repository) SaveAppConfig(ctx context.Context, cfg AppConfig) error {
	if _, err := r.db.Collection(configCollection).Doc(appConfigDoc).Set(ctx, cfg, firestore.MergeAll); err != nil {
		return fmt.Errorf("save app config: %w", err)
	}
	return nil
}
