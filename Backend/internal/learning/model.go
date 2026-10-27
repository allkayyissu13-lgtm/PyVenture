// Package learning: Fitur 1 - latihan Python dengan penilaian otomatis.
package learning

const (
	StatusAccepted = "accepted"
	StatusWrong    = "wrong_answer"
	StatusRuntime  = "runtime_error"
	StatusTimeout  = "timeout"
	StatusSkipped  = "skipped" // hanya untuk hasil per-test
	StatusPassed   = "passed"  // hanya untuk hasil per-test
)

type ExerciseSummary struct {
	ID         int    `json:"id"`
	Slug       string `json:"slug"`
	Title      string `json:"title"`
	Difficulty string `json:"difficulty"`
	Solved     bool   `json:"solved"`
	Attempted  bool   `json:"attempted"`
}

type SampleTest struct {
	Input    string `json:"input"`
	Expected string `json:"expected"`
}

type Exercise struct {
	ID           int          `json:"id"`
	Slug         string       `json:"slug"`
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	Difficulty   string       `json:"difficulty"`
	StarterCode  string       `json:"starter_code"`
	InputFormat  string       `json:"input_format"`
	OutputFormat string       `json:"output_format"`
	Samples      []SampleTest `json:"samples"`
	Hints        HintState    `json:"hints"`
}

type Hint struct {
	Position int    `json:"position"`
	Content  string `json:"content"`
}

// HintState = hint yang SUDAH dibuka user (tombol "Hint Clue (1/3)").
type HintState struct {
	Total    int    `json:"total"`
	Revealed int    `json:"revealed"`
	Items    []Hint `json:"items"`
}

// RunResponse = isi panel Terminal untuk tombol "Jalankan Kode".
type RunResponse struct {
	Stdin    string  `json:"stdin"`
	Stdout   string  `json:"stdout"`
	Stderr   string  `json:"stderr"`
	ExitCode int     `json:"exit_code"`
	TimedOut bool    `json:"timed_out"`
	TimeMs   int64   `json:"time_ms"`
	MemoryKB int64   `json:"memory_kb"`
	Expected *string `json:"expected,omitempty"` // hanya jika memakai contoh test bawaan
}

type TestCase struct {
	Input    string
	Expected string
	Hidden   bool
}

type TestResult struct {
	Index    int    `json:"index"`
	Hidden   bool   `json:"hidden"`
	Status   string `json:"status"`
	Input    string `json:"input,omitempty"`
	Expected string `json:"expected,omitempty"`
	Actual   string `json:"actual,omitempty"`
	Error    string `json:"error,omitempty"`
}

type SubmitResult struct {
	SubmissionID int64        `json:"submission_id"`
	Status       string       `json:"status"`
	Passed       int          `json:"passed"`
	Total        int          `json:"total"`
	TimeMs       int64        `json:"time_ms"`   // terlama di antara semua test
	MemoryKB     int64        `json:"memory_kb"` // terbesar di antara semua test
	Results      []TestResult `json:"results"`
}
