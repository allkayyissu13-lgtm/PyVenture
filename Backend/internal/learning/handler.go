package learning

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"pyventure/internal/auth"
	"pyventure/internal/httpx"
)

const (
	maxCodeBytes  = 20_000
	maxStdinBytes = 10_000
)

// Gate memutuskan apakah sebuah latihan boleh dibuka user (mis. stage-nya
// sudah terbuka dan challenge sebelumnya sudah selesai). Diisi dari luar
// (paket course) supaya learning tidak perlu tahu isi tabel level/stage.
// Kalau nil, semua latihan terbuka.
type Gate interface {
	ExerciseUnlocked(ctx context.Context, userID string, exerciseID int) (bool, error)
}

type Handler struct {
	Repo  *Repo
	Judge *Judge
	Gate  Gate
}

func NewHandler(repo *Repo, judge *Judge) *Handler {
	return &Handler{Repo: repo, Judge: judge}
}

// Routes mendaftarkan endpoint. protect = middleware JWT.
func (h *Handler) Routes(mux *http.ServeMux, protect func(http.Handler) http.Handler) {
	mux.Handle("GET /api/exercises", protect(http.HandlerFunc(h.List)))
	mux.Handle("GET /api/exercises/{slug}", protect(http.HandlerFunc(h.Get)))
	mux.Handle("POST /api/exercises/{slug}/run", protect(http.HandlerFunc(h.Run)))
	mux.Handle("POST /api/exercises/{slug}/submit", protect(http.HandlerFunc(h.Submit)))
	mux.Handle("POST /api/exercises/{slug}/hints/next", protect(http.HandlerFunc(h.NextHint)))
}

// loadAllowed mengambil latihan berdasarkan slug di URL dan memastikan user
// boleh mengaksesnya. Respons error dikirim di sini; false = handler berhenti.
func (h *Handler) loadAllowed(w http.ResponseWriter, r *http.Request) (*Exercise, bool) {
	ex, err := h.Repo.BySlug(r.Context(), r.PathValue("slug"))
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "latihan tidak ditemukan")
		return nil, false
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil latihan")
		return nil, false
	}
	if h.Gate != nil {
		ok, err := h.Gate.ExerciseUnlocked(r.Context(), auth.UserID(r.Context()), ex.ID)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "gagal memeriksa akses latihan")
			return nil, false
		}
		if !ok {
			httpx.Error(w, http.StatusForbidden, "challenge ini masih terkunci, selesaikan yang sebelumnya dulu")
			return nil, false
		}
	}
	return ex, true
}

// decodeCode membaca {"code": "..."} dan memvalidasinya.
func decodeCode(w http.ResponseWriter, r *http.Request, dst any, code func() string) bool {
	if err := httpx.Decode(w, r, dst); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return false
	}
	c := code()
	if strings.TrimSpace(c) == "" {
		httpx.Error(w, http.StatusBadRequest, "kode tidak boleh kosong")
		return false
	}
	if len(c) > maxCodeBytes {
		httpx.Error(w, http.StatusBadRequest, "kode terlalu panjang (maks 20 KB)")
		return false
	}
	return true
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

// Get: seluruh isi halaman eksekusi kode (soal, format I/O, contoh, hint yang sudah dibuka).
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	ex, ok := h.loadAllowed(w, r)
	if !ok {
		return
	}
	hints, err := h.Repo.HintState(r.Context(), auth.UserID(r.Context()), ex.ID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil hint")
		return
	}
	ex.Hints = hints
	httpx.JSON(w, http.StatusOK, ex)
}

// Run = tombol "Jalankan Kode": jalankan apa adanya, tidak dinilai, tidak disimpan.
// Tanpa "stdin", dipakai input contoh test pertama (lengkap dengan output yang diharapkan).
func (h *Handler) Run(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code  string  `json:"code"`
		Stdin *string `json:"stdin"`
	}
	if !decodeCode(w, r, &req, func() string { return req.Code }) {
		return
	}
	if req.Stdin != nil && len(*req.Stdin) > maxStdinBytes {
		httpx.Error(w, http.StatusBadRequest, "input terlalu panjang (maks 10 KB)")
		return
	}
	ex, ok := h.loadAllowed(w, r)
	if !ok {
		return
	}

	resp := RunResponse{}
	if req.Stdin != nil {
		resp.Stdin = *req.Stdin
	} else {
		tests, err := h.Repo.TestCases(r.Context(), ex.ID)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "gagal mengambil contoh test")
			return
		}
		for _, t := range tests {
			if !t.Hidden {
				exp := t.Expected
				resp.Stdin, resp.Expected = t.Input, &exp
				break
			}
		}
	}

	rr, err := h.Judge.Run(r.Context(), req.Code, resp.Stdin)
	if errors.Is(err, ErrBusy) {
		httpx.Error(w, http.StatusTooManyRequests, "server sedang sibuk menjalankan kode, coba lagi sebentar")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menjalankan kode")
		return
	}
	resp.Stdout, resp.Stderr, resp.ExitCode = rr.Stdout, rr.Stderr, rr.ExitCode
	resp.TimedOut, resp.TimeMs, resp.MemoryKB = rr.TimedOut, rr.DurationMs, rr.MemoryKB
	httpx.JSON(w, http.StatusOK, resp)
}

// Submit = tombol "Submit Solusi": dinilai terhadap semua test dan disimpan.
func (h *Handler) Submit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code string `json:"code"`
	}
	if !decodeCode(w, r, &req, func() string { return req.Code }) {
		return
	}
	ex, ok := h.loadAllowed(w, r)
	if !ok {
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

	res, err := h.Judge.Grade(r.Context(), req.Code, tests)
	if errors.Is(err, ErrBusy) {
		httpx.Error(w, http.StatusTooManyRequests, "server sedang sibuk menilai kode, coba lagi sebentar")
		return
	}
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

// NextHint = tombol "Hint Clue": buka satu hint berikutnya.
func (h *Handler) NextHint(w http.ResponseWriter, r *http.Request) {
	ex, ok := h.loadAllowed(w, r)
	if !ok {
		return
	}
	err := h.Repo.RevealNextHint(r.Context(), auth.UserID(r.Context()), ex.ID)
	if errors.Is(err, ErrNoHints) {
		httpx.Error(w, http.StatusConflict, "latihan ini belum punya hint")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal membuka hint")
		return
	}
	hints, err := h.Repo.HintState(r.Context(), auth.UserID(r.Context()), ex.ID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil hint")
		return
	}
	httpx.JSON(w, http.StatusOK, hints)
}
