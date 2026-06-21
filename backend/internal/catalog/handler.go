package catalog

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

// Handler exposes the catalog service over HTTP.
type Handler struct {
	svc *Service
}

// NewHandler wires a handler to its service.
func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// Register attaches catalog routes to the mux. Go 1.22+ method-aware patterns
// bind verb + path in one string.
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/remedies", h.listRemedies)
	mux.HandleFunc("GET /api/remedies/{id}", h.getRemedy)
	mux.HandleFunc("GET /api/categories", h.listCategories)
	mux.HandleFunc("GET /api/ingredients", h.listIngredients)
	mux.HandleFunc("GET /api/config", h.getConfig)
}

func (h *Handler) listRemedies(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.ListRemedies(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list remedies", err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) getRemedy(w http.ResponseWriter, r *http.Request) {
	rem, err := h.svc.GetRemedy(r.Context(), r.PathValue("id"))
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			writeError(w, http.StatusNotFound, "remedy not found", nil)
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get remedy", err)
		return
	}
	writeJSON(w, http.StatusOK, rem)
}

func (h *Handler) listCategories(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.ListCategories(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list categories", err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) listIngredients(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.ListIngredients(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list ingredients", err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) getConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.svc.GetAppConfig(r.Context())
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			writeError(w, http.StatusNotFound, "app config not found", nil)
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get app config", err)
		return
	}
	writeJSON(w, http.StatusOK, cfg)
}

// writeJSON serialises v as JSON with the given status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode response: %v", err)
	}
}

// writeError logs the cause (if any) and returns a clean JSON error without
// leaking internals to the client.
func writeError(w http.ResponseWriter, status int, msg string, cause error) {
	if cause != nil {
		log.Printf("%s: %v", msg, cause)
	}
	writeJSON(w, status, map[string]string{"error": msg})
}
