package course

import (
	"errors"
	"net/http"
	"strconv"

	"pyventure/internal/auth"
	"pyventure/internal/httpx"
)

const maxNoteBytes = 5000

type Handler struct{ Repo *Repo }

func (h *Handler) Routes(mux *http.ServeMux, protect func(http.Handler) http.Handler) {
	mux.Handle("GET /api/map", protect(http.HandlerFunc(h.Map)))
	mux.Handle("GET /api/stages/{slug}", protect(http.HandlerFunc(h.Stage)))
	mux.Handle("GET /api/stages/{slug}/module", protect(http.HandlerFunc(h.Module)))
	mux.Handle("GET /api/exercises/{slug}/context", protect(http.HandlerFunc(h.ExerciseContext)))
	mux.Handle("PUT /api/sections/{id}/note", protect(http.HandlerFunc(h.SaveNote)))
	mux.Handle("POST /api/sections/{id}/complete", protect(http.HandlerFunc(h.Complete)))
	mux.Handle("GET /api/me/progress", protect(http.HandlerFunc(h.Progress)))
}

// Peta belajar (wireframe: Level 1-4 + node stage).
func (h *Handler) Map(w http.ResponseWriter, r *http.Request) {
	levels, err := h.Repo.Map(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil peta belajar")
		return
	}
	httpx.JSON(w, http.StatusOK, levels)
}

// openStage mengambil stage dan menolak kalau tidak ada / masih terkunci.
func (h *Handler) openStage(w http.ResponseWriter, r *http.Request) (*StageState, bool) {
	st, err := h.Repo.StageBySlug(r.Context(), auth.UserID(r.Context()), r.PathValue("slug"))
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "stage tidak ditemukan")
		return nil, false
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil stage")
		return nil, false
	}
	if st.State == StateLocked {
		httpx.Error(w, http.StatusForbidden, "stage ini masih terkunci, selesaikan stage sebelumnya dulu")
		return nil, false
	}
	return st, true
}

// Halaman stage: daftar studi kasus (wireframe: list studi kasus + status).
func (h *Handler) Stage(w http.ResponseWriter, r *http.Request) {
	st, ok := h.openStage(w, r)
	if !ok {
		return
	}
	items, err := h.Repo.Challenges(r.Context(), auth.UserID(r.Context()), st.ID, false)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil studi kasus")
		return
	}
	httpx.JSON(w, http.StatusOK, StageDetail{
		StageState: *st, TrackTitle: st.LevelTitle, Bab: st.Position, Exercises: items,
	})
}

// Header halaman eksekusi kode: track + Bab + chip E1/E2/E3/M1 beserta statusnya.
func (h *Handler) ExerciseContext(w http.ResponseWriter, r *http.Request) {
	c, err := h.Repo.ExerciseContext(r.Context(), auth.UserID(r.Context()), r.PathValue("slug"))
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "latihan tidak ditemukan atau belum masuk ke sebuah stage")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil konteks latihan")
		return
	}
	if c.StageLocked {
		httpx.Error(w, http.StatusForbidden, "stage ini masih terkunci, selesaikan stage sebelumnya dulu")
		return
	}
	httpx.JSON(w, http.StatusOK, c)
}

// Halaman modul: materi + sub-materi + catatan pribadi.
func (h *Handler) Module(w http.ResponseWriter, r *http.Request) {
	st, ok := h.openStage(w, r)
	if !ok {
		return
	}
	secs, err := h.Repo.Sections(r.Context(), auth.UserID(r.Context()), st.ID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil materi")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{
		"stage":    map[string]any{"slug": st.Slug, "title": st.Title, "level_number": st.LevelNumber},
		"sections": secs,
	})
}

// openSection memvalidasi id, keberadaan sub-materi, dan status stage-nya.
func (h *Handler) openSection(w http.ResponseWriter, r *http.Request) (int, bool) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		httpx.Error(w, http.StatusBadRequest, "id sub-materi tidak valid")
		return 0, false
	}
	stageID, err := h.Repo.SectionStageID(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "sub-materi tidak ditemukan")
		return 0, false
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil sub-materi")
		return 0, false
	}
	ok, err := h.Repo.StageUnlocked(r.Context(), auth.UserID(r.Context()), stageID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal memeriksa stage")
		return 0, false
	}
	if !ok {
		httpx.Error(w, http.StatusForbidden, "stage ini masih terkunci")
		return 0, false
	}
	return id, true
}

// Tombol "Save" pada Note.
func (h *Handler) SaveNote(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Note string `json:"note"`
	}
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return
	}
	if len(req.Note) > maxNoteBytes {
		httpx.Error(w, http.StatusBadRequest, "catatan terlalu panjang (maks 5000 byte)")
		return
	}
	id, ok := h.openSection(w, r)
	if !ok {
		return
	}
	if err := h.Repo.SaveNote(r.Context(), auth.UserID(r.Context()), id, req.Note); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menyimpan catatan")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"saved": true})
}

// Tandai sub-materi sudah dibaca.
func (h *Handler) Complete(w http.ResponseWriter, r *http.Request) {
	id, ok := h.openSection(w, r)
	if !ok {
		return
	}
	if err := h.Repo.CompleteSection(r.Context(), auth.UserID(r.Context()), id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal menandai sub-materi")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"completed": true})
}

// Ringkasan progres user (XP, stage selesai, stage berikutnya).
func (h *Handler) Progress(w http.ResponseWriter, r *http.Request) {
	p, err := h.Repo.Progress(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal mengambil progres")
		return
	}
	httpx.JSON(w, http.StatusOK, p)
}
