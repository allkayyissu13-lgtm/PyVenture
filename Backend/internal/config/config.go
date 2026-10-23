// Package config membaca konfigurasi dari environment variable.
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	CORSOrigin    string
	PythonBin     string
	RunTimeout    time.Duration
	MaxConcurrent int
}

func Load() (Config, error) {
	c := Config{
		Port:          get("PORT", "8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
		CORSOrigin:    get("CORS_ORIGIN", "http://localhost:5173"),
		PythonBin:     get("PYTHON_BIN", "python3"),
		RunTimeout:    time.Duration(getInt("RUN_TIMEOUT_SECONDS", 3)) * time.Second,
		MaxConcurrent: getInt("MAX_CONCURRENT_RUNS", 2),
	}
	if c.DatabaseURL == "" {
		return c, fmt.Errorf("DATABASE_URL wajib diisi")
	}
	if len(c.JWTSecret) < 16 {
		return c, fmt.Errorf("JWT_SECRET wajib diisi (minimal 16 karakter)")
	}
	return c, nil
}

func get(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getInt(key string, def int) int {
	if v, err := strconv.Atoi(os.Getenv(key)); err == nil && v > 0 {
		return v
	}
	return def
}
