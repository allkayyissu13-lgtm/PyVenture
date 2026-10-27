package competition

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"pyventure/internal/auth"
	"pyventure/internal/httpx"
	"pyventure/internal/learning"
)

const maxCodeBytes = 20_000

type Handler struct {
	Repo     *Repo
	Learning *learning.Repo // dipakai untuk mengambil test case soal
	Judge    *learning.Judge
}

func (h *Handler) Routes(mux *http.ServeMux, protect func(http.Handler) http.Handler) {
	mux.Handle("GET /api/competitions", protect(http.HandlerFunc(h.List)))
	mux.Handle("GET /api/competitions/{slug}", protect(http.HandlerFunc(h.Get)))
	mux.Handle("GET /api/competitions/{slug}/leaderboard", protect(http.HandlerFunc(h.Leaderboard)))
	mux.Handle("POST /api/competitions/{slug}/problems/{label}/submit", protect(http.HandlerFunc(h.Submit)))
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Repo.List(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil daftar kontes")
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	c, err := h.Repo.BySlug(r.Context(), r.PathValue("slug"), auth.UserID(r.Context()), true)
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "kontes tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil kontes")
		return
	}
	httpx.JSON(w, http.StatusOK, c)
}

func (h *Handler) Leaderboard(w http.ResponseWriter, r *http.Request) {
	c, err := h.Repo.BySlug(r.Context(), r.PathValue("slug"), "", false)
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "kontes tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil kontes")
		return
	}

	limit := 50
	if v, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && v > 0 {
		limit = min(v, 100)
	}
	rows, err := h.Repo.Leaderboard(r.Context(), c.ID, auth.UserID(r.Context()), limit)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil leaderboard")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"state": c.State, "entries": rows})
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

	c, err := h.Repo.BySlug(r.Context(), r.PathValue("slug"), "", false)
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "kontes tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil kontes")
		return
	}
	// Jendela waktu: submission hanya diterima selama kontes berlangsung.
	switch c.State {
	case StateUpcoming:
		httpx.Error(w, http.StatusForbidden, "kontes belum dimulai")
		return
	case StateFinished:
		httpx.Error(w, http.StatusForbidden, "kontes sudah berakhir")
		return
	}

	p, err := h.Repo.ProblemByLabel(r.Context(), c.ID, strings.ToUpper(r.PathValue("label")))
	if errors.Is(err, ErrNoProblem) {
		httpx.Error(w, http.StatusNotFound, "soal tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil soal")
		return
	}
	tests, err := h.Learning.TestCases(r.Context(), p.ExerciseID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil test case")
		return
	}
	if len(tests) == 0 {
		httpx.Error(w, http.StatusConflict, "soal ini belum punya test case")
		return
	}

	res, err := h.Judge.Grade(r.Context(), req.Code, tests)
	if errors.Is(err, learning.ErrBusy) {
		httpx.Error(w, http.StatusTooManyRequests, "server sedang sibuk menilai kode, coba lagi sebentar")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menjalankan kode")
		return
	}

	res.SubmissionID, err = h.Repo.SaveSubmission(r.Context(), auth.UserID(r.Context()), p.ID, req.Code, res)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menyimpan submission")
		return
	}
	httpx.JSON(w, http.StatusOK, res)
}
