package catalog

import "context"

// Write-side service methods. Thin pass-throughs today; validation/business
// rules can land here later without touching transport or data layers.

func (s *Service) SaveRemedy(ctx context.Context, id string, rem Remedy) (string, error) {
	return s.repo.SaveRemedy(ctx, id, rem)
}

func (s *Service) DeleteRemedy(ctx context.Context, id string) error {
	return s.repo.DeleteRemedy(ctx, id)
}

func (s *Service) SaveCategory(ctx context.Context, id string, cat Category) (string, error) {
	return s.repo.SaveCategory(ctx, id, cat)
}

func (s *Service) DeleteCategory(ctx context.Context, id string) error {
	return s.repo.DeleteCategory(ctx, id)
}

func (s *Service) SaveIngredient(ctx context.Context, id string, ing Ingredient) (string, error) {
	return s.repo.SaveIngredient(ctx, id, ing)
}

func (s *Service) DeleteIngredient(ctx context.Context, id string) error {
	return s.repo.DeleteIngredient(ctx, id)
}

func (s *Service) SaveAppConfig(ctx context.Context, cfg AppConfig) error {
	return s.repo.SaveAppConfig(ctx, cfg)
}
