package catalog

import (
	"encoding/json"
	"net/http"
)

// RegisterWrite attaches the mutating routes to the mux, each wrapped with the
// given middleware (auth). Kept separate from the public read routes so the
// router can protect exactly these.
func (h *Handler) RegisterWrite(mux *http.ServeMux, guard func(http.Handler) http.Handler) {
	p := func(pattern string, fn http.HandlerFunc) {
		mux.Handle(pattern, guard(fn))
	}
	p("POST /api/remedies", h.saveRemedy)
	p("PUT /api/remedies/{id}", h.saveRemedy)
	p("DELETE /api/remedies/{id}", h.deleteRemedy)

	p("POST /api/categories", h.saveCategory)
	p("PUT /api/categories/{id}", h.saveCategory)
	p("DELETE /api/categories/{id}", h.deleteCategory)

	p("POST /api/ingredients", h.saveIngredient)
	p("PUT /api/ingredients/{id}", h.saveIngredient)
	p("DELETE /api/ingredients/{id}", h.deleteIngredient)

	p("PUT /api/config", h.saveConfig)
}

func (h *Handler) saveRemedy(w http.ResponseWriter, r *http.Request) {
	var rem Remedy
	if err := json.NewDecoder(r.Body).Decode(&rem); err != nil {
		writeError(w, http.StatusBadRequest, "invalid remedy body", err)
		return
	}
	id := r.PathValue("id") // empty for POST
	if id == "" {
		id = rem.ID
	}
	saved, err := h.svc.SaveRemedy(r.Context(), id, rem)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save remedy", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": saved})
}

func (h *Handler) deleteRemedy(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteRemedy(r.Context(), r.PathValue("id")); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete remedy", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) saveCategory(w http.ResponseWriter, r *http.Request) {
	var cat Category
	if err := json.NewDecoder(r.Body).Decode(&cat); err != nil {
		writeError(w, http.StatusBadRequest, "invalid category body", err)
		return
	}
	id := r.PathValue("id")
	if id == "" {
		id = cat.ID
	}
	saved, err := h.svc.SaveCategory(r.Context(), id, cat)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save category", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": saved})
}

func (h *Handler) deleteCategory(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteCategory(r.Context(), r.PathValue("id")); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete category", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) saveIngredient(w http.ResponseWriter, r *http.Request) {
	var ing Ingredient
	if err := json.NewDecoder(r.Body).Decode(&ing); err != nil {
		writeError(w, http.StatusBadRequest, "invalid ingredient body", err)
		return
	}
	id := r.PathValue("id")
	if id == "" {
		id = ing.ID
	}
	saved, err := h.svc.SaveIngredient(r.Context(), id, ing)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save ingredient", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": saved})
}

func (h *Handler) deleteIngredient(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteIngredient(r.Context(), r.PathValue("id")); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete ingredient", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) saveConfig(w http.ResponseWriter, r *http.Request) {
	var cfg AppConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		writeError(w, http.StatusBadRequest, "invalid config body", err)
		return
	}
	if err := h.svc.SaveAppConfig(r.Context(), cfg); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save config", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
