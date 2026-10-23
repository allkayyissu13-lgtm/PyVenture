package learning

import (
	"errors"
	"net/http"
	"strings"

	"pyventure/internal/auth"
	"pyventure/internal/httpx"
)

const maxCodeBytes = 20_000

type Handler struct {
	Repo   *Repo
	Runner CodeRunner
	sem    chan struct{} // batasi eksekusi kode paralel (server gratisan = RAM kecil)
}

func NewHandler(repo *Repo, runner CodeRunner, maxConcurrent int) *Handler {
	return &Handler{Repo: repo, Runner: runner, sem: make(chan struct{}, maxConcurrent)}
}

// Routes mendaftarkan endpoint. protect = middleware JWT.
func (h *Handler) Routes(mux *http.ServeMux, protect func(http.Handler) http.Handler) {
	mux.Handle("GET /api/exercises", protect(http.HandlerFunc(h.List)))
	mux.Handle("GET /api/exercises/{slug}", protect(http.HandlerFunc(h.Get)))
	mux.Handle("POST /api/exercises/{slug}/submit", protect(http.HandlerFunc(h.Submit)))
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	difficulty := r.URL.Query().Get("difficulty")
	switch difficulty {
	case "", "beginner", "intermediate", "advanced":
	default:
		httpx.Error(w, http.StatusBadRequest, "difficulty harus beginner, intermediate, atau advanced")
		return
	}
	items, err := h.Repo.List(r.Context(), auth.UserID(r.Context()), difficulty)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil daftar latihan")
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	ex, err := h.Repo.BySlug(r.Context(), r.PathValue("slug"))
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "latihan tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil latihan")
		return
	}
	httpx.JSON(w, http.StatusOK, ex)
}

func (h *Handler) Submit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code string `json:"code"`
	}
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return
	}
	if strings.TrimSpace(req.Code) == "" {
		httpx.Error(w, http.StatusBadRequest, "kode tidak boleh kosong")
		return
	}
	if len(req.Code) > maxCodeBytes {
		httpx.Error(w, http.StatusBadRequest, "kode terlalu panjang (maks 20 KB)")
		return
	}

	ex, err := h.Repo.BySlug(r.Context(), r.PathValue("slug"))
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "latihan tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil latihan")
		return
	}
	tests, err := h.Repo.TestCases(r.Context(), ex.ID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil test case")
		return
	}
	if len(tests) == 0 {
		httpx.Error(w, http.StatusConflict, "latihan ini belum punya test case")
		return
	}

	select {
	case h.sem <- struct{}{}:
		defer func() { <-h.sem }()
	default:
		httpx.Error(w, http.StatusTooManyRequests, "server sedang sibuk menilai kode, coba lagi sebentar")
		return
	}

	res, err := Grade(r.Context(), h.Runner, req.Code, tests)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menjalankan kode")
		return
	}

	res.SubmissionID, err = h.Repo.SaveSubmission(r.Context(), auth.UserID(r.Context()), ex.ID, req.Code, res)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menyimpan submission")
		return
	}
	httpx.JSON(w, http.StatusOK, res)
}
