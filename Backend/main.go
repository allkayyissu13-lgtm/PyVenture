package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/lib/pq"

	"pyventure/internal/auth"
	"pyventure/internal/config"
	"pyventure/internal/course"
	"pyventure/internal/learning"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	// Free tier Supabase membatasi koneksi, jadi pool dibuat kecil.
	db.SetMaxOpenConns(5)
	db.SetMaxIdleConns(2)
	db.SetConnMaxLifetime(30 * time.Minute)

	pingCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err := db.PingContext(pingCtx); err != nil {
		log.Fatalf("tidak bisa konek ke database: %v", err)
	}
	cancel()

	authSvc := &auth.Service{DB: db, Secret: []byte(cfg.JWTSecret), TTL: 72 * time.Hour}
	runner := &learning.PythonRunner{PythonBin: cfg.PythonBin, Timeout: cfg.RunTimeout, MaxOutput: 64 << 10}
	judge := learning.NewJudge(runner, cfg.MaxConcurrent) // dipakai bersama Learning & Kompetisi
	learningRepo := &learning.Repo{DB: db}
	courseRepo := &course.Repo{DB: db}
	learningH := learning.NewHandler(learningRepo, judge)
	learningH.Gate = courseRepo // latihan di stage terkunci tidak bisa dibuka / dikerjakan
	courseH := &course.Handler{Repo: courseRepo}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })
	mux.HandleFunc("POST /api/auth/register", authSvc.Register)
	mux.HandleFunc("POST /api/auth/login", authSvc.Login)
	learningH.Routes(mux, authSvc.Require)
	courseH.Routes(mux, authSvc.Require)
	// Kompetisi & Leaderboard ditunda: paket internal/competition dan migrations/postponed/
	// disimpan, tinggal dipasang di sini lagi nanti.

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           cors(cfg.CORSOrigin, logRequests(mux)),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      60 * time.Second, // harus > total waktu penilaian
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
	}()

	log.Printf("PyVenture API berjalan di :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
