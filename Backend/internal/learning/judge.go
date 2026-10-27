package learning

import (
	"context"
	"errors"
)

var ErrBusy = errors.New("judge sedang penuh")

// Judge membungkus runner + pembatas eksekusi paralel. Dipakai bersama oleh
// fitur Learning dan Kompetisi, jadi total kode yang berjalan bersamaan
// tetap dibatasi satu angka (server gratisan = RAM kecil).
type Judge struct {
	runner CodeRunner
	sem    chan struct{}
}

func NewJudge(runner CodeRunner, maxConcurrent int) *Judge {
	return &Judge{runner: runner, sem: make(chan struct{}, maxConcurrent)}
}

// Grade mengembalikan ErrBusy kalau semua slot sedang dipakai.
func (j *Judge) Grade(ctx context.Context, code string, tests []TestCase) (*SubmitResult, error) {
	select {
	case j.sem <- struct{}{}:
		defer func() { <-j.sem }()
	default:
		return nil, ErrBusy
	}
	return Grade(ctx, j.runner, code, tests)
}

// Run menjalankan kode apa adanya (tanpa menilai) untuk tombol "Jalankan Kode".
// Memakai slot yang sama dengan Grade.
func (j *Judge) Run(ctx context.Context, code, stdin string) (RunResult, error) {
	select {
	case j.sem <- struct{}{}:
		defer func() { <-j.sem }()
	default:
		return RunResult{}, ErrBusy
	}
	return j.runner.Run(ctx, code, stdin)
}
