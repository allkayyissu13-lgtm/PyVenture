package learning

import (
	"context"
	"testing"
	"time"
)

func newRunner() *PythonRunner {
	return &PythonRunner{PythonBin: "python3", Timeout: 1 * time.Second, MaxOutput: 4096}
}

var sumTests = []TestCase{
	{Input: "2\n3", Expected: "5"},
	{Input: "10\n-4", Expected: "6"},
	{Input: "7\n8", Expected: "15", Hidden: true},
}

func grade(t *testing.T, code string) *SubmitResult {
	t.Helper()
	res, err := Grade(context.Background(), newRunner(), code, sumTests)
	if err != nil {
		t.Fatal(err)
	}
	return res
}

func TestAccepted(t *testing.T) {
	res := grade(t, "a=int(input())\nb=int(input())\nprint(a+b)\n")
	if res.Status != StatusAccepted || res.Passed != 3 {
		t.Fatalf("got %+v", res)
	}
}

func TestWrongAnswerHidesHiddenTest(t *testing.T) {
	res := grade(t, "a=int(input())\nb=int(input())\nprint(a*b)\n")
	if res.Status != StatusWrong {
		t.Fatalf("status = %s", res.Status)
	}
	h := res.Results[2]
	if !h.Hidden || h.Input != "" || h.Expected != "" || h.Actual != "" {
		t.Fatalf("hidden test bocor: %+v", h)
	}
}

func TestRuntimeError(t *testing.T) {
	res := grade(t, "print(undefined_name)\n")
	if res.Status != StatusRuntime || res.Results[0].Error == "" {
		t.Fatalf("got %+v", res)
	}
}

func TestTimeoutSkipsRemaining(t *testing.T) {
	res := grade(t, "while True:\n    pass\n")
	if res.Status != StatusTimeout || res.Results[1].Status != StatusSkipped {
		t.Fatalf("got %+v", res)
	}
}

func TestNormalizeIgnoresTrailingWhitespace(t *testing.T) {
	res := grade(t, "a=int(input())\nb=int(input())\nprint(a+b, end='  \\n\\n')\n")
	if res.Status != StatusAccepted {
		t.Fatalf("got %+v", res)
	}
}
