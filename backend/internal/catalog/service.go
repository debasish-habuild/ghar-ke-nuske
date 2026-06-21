package catalog

import "context"

// Service holds catalog business logic. Currently a thin pass-through to the
// repository; keeping it distinct leaves room for caching/filtering later
// without touching transport or data layers.
type Service struct {
	repo *Repository
}

// NewService wires a service to its repository.
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// ListRemedies returns all remedies.
func (s *Service) ListRemedies(ctx context.Context) ([]Remedy, error) {
	return s.repo.ListRemedies(ctx)
}

// GetRemedy returns one remedy by id (ErrNotFound if missing).
func (s *Service) GetRemedy(ctx context.Context, id string) (Remedy, error) {
	return s.repo.GetRemedy(ctx, id)
}

// ListCategories returns all categories.
func (s *Service) ListCategories(ctx context.Context) ([]Category, error) {
	return s.repo.ListCategories(ctx)
}

// ListIngredients returns all ingredients.
func (s *Service) ListIngredients(ctx context.Context) ([]Ingredient, error) {
	return s.repo.ListIngredients(ctx)
}

// GetAppConfig returns the app config document.
func (s *Service) GetAppConfig(ctx context.Context) (AppConfig, error) {
	return s.repo.GetAppConfig(ctx)
}
