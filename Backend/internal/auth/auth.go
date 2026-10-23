// Package auth: register, login, dan middleware JWT.
// Login ditangani backend Go sendiri (bukan Supabase Auth); tabel profiles
// menyimpan email + password_hash (bcrypt).
package auth

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"

	"pyventure/internal/httpx"
)

type ctxKey struct{}

type Service struct {
	DB     *sql.DB
	Secret []byte
	TTL    time.Duration
}

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type authResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return
	}
	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if n := len(req.Username); n < 3 || n > 30 {
		httpx.Error(w, http.StatusBadRequest, "username harus 3-30 karakter")
		return
	}
	if _, err := mail.ParseAddress(req.Email); err != nil {
		httpx.Error(w, http.StatusBadRequest, "format email tidak valid")
		return
	}
	// bcrypt hanya memproses 72 byte pertama, jadi batasi di sini.
	if n := len(req.Password); n < 8 || n > 72 {
		httpx.Error(w, http.StatusBadRequest, "password harus 8-72 karakter")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal memproses password")
		return
	}

	u := User{Username: req.Username, Email: req.Email}
	err = s.DB.QueryRowContext(r.Context(),
		`INSERT INTO profiles (username, email, password_hash)
		 VALUES ($1, $2, $3) RETURNING id`,
		u.Username, u.Email, string(hash),
	).Scan(&u.ID)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" { // unique_violation
			httpx.Error(w, http.StatusConflict, "email atau username sudah dipakai")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "gagal membuat akun")
		return
	}

	s.respondWithToken(w, http.StatusCreated, u)
}

func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := httpx.Decode(w, r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "body JSON tidak valid")
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	var u User
	var hash string
	err := s.DB.QueryRowContext(r.Context(),
		`SELECT id, username, email, password_hash FROM profiles WHERE email = $1`, email,
	).Scan(&u.ID, &u.Username, &u.Email, &hash)

	// Pesan sama untuk "email tidak ada" dan "password salah" supaya
	// penyerang tidak bisa menebak email mana yang terdaftar.
	const invalid = "email atau password salah"
	if errors.Is(err, sql.ErrNoRows) {
		httpx.Error(w, http.StatusUnauthorized, invalid)
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "terjadi kesalahan server")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		httpx.Error(w, http.StatusUnauthorized, invalid)
		return
	}

	s.respondWithToken(w, http.StatusOK, u)
}

func (s *Service) respondWithToken(w http.ResponseWriter, status int, u User) {
	now := time.Now()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Subject:   u.ID,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(s.TTL)),
	}).SignedString(s.Secret)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "gagal membuat token")
		return
	}
	httpx.JSON(w, status, authResponse{Token: token, User: u})
}

// Require adalah middleware: tolak request tanpa JWT valid, lalu simpan
// user id ke context.
func (s *Service) Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		if !ok || raw == "" {
			httpx.Error(w, http.StatusUnauthorized, "token tidak ada")
			return
		}
		claims := &jwt.RegisteredClaims{}
		tok, err := jwt.ParseWithClaims(raw, claims,
			func(*jwt.Token) (any, error) { return s.Secret, nil },
			// Kunci algoritma ke HS256 -> mencegah serangan algorithm confusion
			// (mis. token "alg":"none").
			jwt.WithValidMethods([]string{"HS256"}),
		)
		if err != nil || !tok.Valid || claims.Subject == "" {
			httpx.Error(w, http.StatusUnauthorized, "token tidak valid atau kedaluwarsa")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxKey{}, claims.Subject)))
	})
}

// UserID mengambil id user yang sudah diverifikasi middleware Require.
func UserID(ctx context.Context) string {
	id, _ := ctx.Value(ctxKey{}).(string)
	return id
}
