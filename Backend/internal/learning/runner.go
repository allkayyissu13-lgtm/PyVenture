package learning

import (
	"bytes"
	"context"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type RunResult struct {
	Stdout     string
	Stderr     string
	ExitCode   int
	TimedOut   bool
	DurationMs int64 // lama proses berjalan (termasuk start interpreter)
	MemoryKB   int64 // puncak memori (RSS); 0 jika OS tidak mendukung (hanya Linux)
}

// cleanEnv: environment minimal untuk kode user (JWT_SECRET / DATABASE_URL tidak ikut).
func cleanEnv() []string {
	env := []string{"PATH=" + os.Getenv("PATH")}
	if runtime.GOOS == "windows" {
		// Python di Windows gagal start tanpa SYSTEMROOT.
		env = append(env, "SYSTEMROOT="+os.Getenv("SYSTEMROOT"))
	}
	return env
}

// CodeRunner dibuat interface supaya grader bisa diuji dengan runner palsu,
// dan nanti bisa diganti (mis. ke layanan sandbox) tanpa mengubah handler.
type CodeRunner interface {
	Run(ctx context.Context, code, stdin string) (RunResult, error)
}

// PythonRunner menjalankan kode user dengan `python3` lokal.
// PERHATIAN: ini bukan sandbox sungguhan (lihat catatan keamanan di README).
type PythonRunner struct {
	PythonBin string
	Timeout   time.Duration
	MaxOutput int // byte
}

func (p *PythonRunner) Run(ctx context.Context, code, stdin string) (RunResult, error) {
	dir, err := os.MkdirTemp("", "pyv-")
	if err != nil {
		return RunResult{}, err
	}
	defer os.RemoveAll(dir)

	if err := os.WriteFile(filepath.Join(dir, "main.py"), []byte(code), 0o600); err != nil {
		return RunResult{}, err
	}

	runCtx, cancel := context.WithTimeout(ctx, p.Timeout)
	defer cancel()

	// -I : isolated mode (abaikan env PYTHON* & user site)
	// -X utf8 : output selalu UTF-8
	cmd := exec.CommandContext(runCtx, p.PythonBin, "-I", "-X", "utf8", "main.py")
	cmd.Dir = dir
	cmd.Env = cleanEnv()
	cmd.Stdin = strings.NewReader(stdin)
	cmd.WaitDelay = 500 * time.Millisecond

	stdout := &limitedBuffer{max: p.MaxOutput}
	stderr := &limitedBuffer{max: p.MaxOutput}
	cmd.Stdout, cmd.Stderr = stdout, stderr

	start := time.Now()
	runErr := cmd.Run()
	elapsed := time.Since(start)

	if ctx.Err() != nil { // klien membatalkan request
		return RunResult{}, ctx.Err()
	}
	res := RunResult{
		DurationMs: elapsed.Milliseconds(),
		MemoryKB:   maxRSSKB(cmd.ProcessState),
		Stdout:     stdout.String(),
		// Path temp di traceback tidak berguna bagi user.
		Stderr: strings.ReplaceAll(stderr.String(), dir+string(filepath.Separator), ""),
	}
	if errors.Is(runCtx.Err(), context.DeadlineExceeded) {
		res.TimedOut = true
		return res, nil
	}
	if runErr != nil {
		var exitErr *exec.ExitError
		if errors.As(runErr, &exitErr) {
			res.ExitCode = exitErr.ExitCode()
			return res, nil
		}
		return RunResult{}, runErr // mis. python3 tidak ditemukan
	}
	return res, nil
}

// limitedBuffer menyimpan output sampai batas tertentu; sisanya dibuang
// (tetap "diterima" supaya proses user tidak macet menulis ke pipe).
type limitedBuffer struct {
	buf       bytes.Buffer
	max       int
	truncated bool
}

func (l *limitedBuffer) Write(p []byte) (int, error) {
	remain := l.max - l.buf.Len()
	switch {
	case remain <= 0:
		l.truncated = len(p) > 0 || l.truncated
	case len(p) > remain:
		l.buf.Write(p[:remain])
		l.truncated = true
	default:
		l.buf.Write(p)
	}
	return len(p), nil
}

func (l *limitedBuffer) String() string {
	if l.truncated {
		return l.buf.String() + "\n...[output dipotong]"
	}
	return l.buf.String()
}
