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
	ID          int          `json:"id"`
	Slug        string       `json:"slug"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Difficulty  string       `json:"difficulty"`
	StarterCode string       `json:"starter_code"`
	Samples     []SampleTest `json:"samples"`
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
	Results      []TestResult `json:"results"`
}
