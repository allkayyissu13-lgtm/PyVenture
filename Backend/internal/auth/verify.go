package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"

	"pyventure/internal/httpx"
)

// Kode berlaku 10 menit, kirim ulang minimal tiap 60 detik (diatur di SQL di bawah),
// dan maksimal 5 kali salah tebak per kode.
const maxAttempts = 5

func newCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// Yang disimpan di DB hanya HMAC kode, bukan kodenya.
func (s *Service) hashCode(profileID, code string) string {
	m := hmac.New(sha256.New, s.Secret)
	m.Write([]byte(profileID + ":" + code))
	return hex.EncodeToString(m.Sum(nil))
}

func isSixDigits(s string) bool {
	if len(s) != 6 {
		return false
	}
	for i := 0; i < len(s); i++ {
		if s[i] < '0' || s[i] > '9' {
			return false
		}
	}
	return true
}

// sendCode membuat kode baru (menimpa yang lama) lalu mengirimnya lewat email.
func (s *Service) sendCode(ctx context.Context, profileID, email string) error {
	code, err := newCode()
	if err != nil {
		return err
	}
	_, err = s.DB.ExecContext(ctx,
		`INSERT INTO email_verifications (profile_id, code_hash, expires_at, attempts, last_sent_at)
		 VALUES ($1, $2, now() + interval '10 minutes', 0, now())
		 ON CONFLICT (profile_id) DO UPDATE
		 SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at,
		     attempts = 0, last_sent_at = now()`,
		profileID, s.hashCode(profileID, code),
	)
	if err != nil {
		return err
	}
	body := fmt.Sprintf(
		"Halo, petualang!\r\n\r\nKode verifikasi PyVenture kamu: %s\r\n\r\n"+
			"Kode berlaku 10 menit. Jika kamu tidak mendaftar, abaikan email ini.\r\n", code)
	return s.Mail.Send(email, "Kode verifikasi PyVenture", body)
}

// Verify: POST /api/auth/verify  {"email": "...", "code": "123456"}
// Kalau benar -> email ditandai terverifikasi dan user langsung login (token dikirim).
func (s *Service) Verify(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	code := strings.TrimSpace(req.Code)
	if !isSixDigits(code) {
		httpx.Error(w, http.StatusBadRequest, "kode harus 6 digit angka")
		return
	}

	var u User
	var verified sql.NullTime
	err := s.DB.QueryRowContext(r.Context(),
		`SELECT id, username, email, email_verified_at FROM profiles WHERE email = $1`, email,
	).Scan(&u.ID, &u.Username, &u.Email, &verified)
	if errors.Is(err, sql.ErrNoRows) {
		httpx.Error(w, http.StatusBadRequest, "kode salah atau kedaluwarsa")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	if verified.Valid {
		httpx.Error(w, http.StatusConflict, "email sudah terverifikasi, silakan masuk")
		return
	}

	// Tambah hitungan percobaan DULU (atomik), baru bandingkan kode.
	// Setelah 5 kali salah, baris ini tidak ditemukan lagi -> harus kirim ulang kode.
	var hash string
	var notExpired bool
	err = s.DB.QueryRowContext(r.Context(),
		`UPDATE email_verifications SET attempts = attempts + 1
		 WHERE profile_id = $1 AND attempts < $2
		 RETURNING code_hash, expires_at > now()`, u.ID, maxAttempts,
	).Scan(&hash, &notExpired)
	if errors.Is(err, sql.ErrNoRows) {
		httpx.Error(w, http.StatusBadRequest, "kode tidak berlaku, tekan Kirim ulang kode")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	if !notExpired || !hmac.Equal([]byte(hash), []byte(s.hashCode(u.ID, code))) {
		httpx.Error(w, http.StatusBadRequest, "kode salah atau kedaluwarsa")
		return
	}

	tx, err := s.DB.BeginTx(r.Context(), nil)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(r.Context(),
		`UPDATE profiles SET email_verified_at = now() WHERE id = $1`, u.ID); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	if _, err := tx.ExecContext(r.Context(),
		`DELETE FROM email_verifications WHERE profile_id = $1`, u.ID); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	if err := tx.Commit(); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}

	s.respondWithToken(w, http.StatusOK, u)
}

// Resend: POST /api/auth/resend  {"email": "..."}
// Jawaban selalu sama untuk email tidak dikenal / sudah terverifikasi (anti-enumerasi).
func (s *Service) Resend(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	done := func() {
		httpx.JSON(w, http.StatusOK, map[string]string{
			"message": "jika email terdaftar dan belum terverifikasi, kode baru sudah dikirim",
		})
	}

	var id string
	var verified sql.NullTime
	err := s.DB.QueryRowContext(r.Context(),
		`SELECT id, email_verified_at FROM profiles WHERE email = $1`, email,
	).Scan(&id, &verified)
	if errors.Is(err, sql.ErrNoRows) || (err == nil && verified.Valid) {
		done()
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}

	// Jeda 60 detik antar pengiriman (dihitung di database supaya tidak tergantung jam server).
	var tooSoon bool
	err = s.DB.QueryRowContext(r.Context(),
		`SELECT last_sent_at > now() - interval '60 seconds'
		 FROM email_verifications WHERE profile_id = $1`, id,
	).Scan(&tooSoon)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	if tooSoon {
		httpx.Error(w, http.StatusTooManyRequests, "tunggu sebentar sebelum kirim ulang kode")
		return
	}

	if err := s.sendCode(r.Context(), id, email); err != nil {
		log.Printf("kirim ulang kode verifikasi gagal: %v", err)
		httpx.Error(w, http.StatusInternalServerError, "gagal mengirim email, coba lagi nanti")
		return
	}
	done()
}
