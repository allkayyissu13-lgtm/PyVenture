package learning

import (
	"context"
	"strings"
)

var severity = map[string]int{StatusAccepted: 0, StatusWrong: 1, StatusRuntime: 2, StatusTimeout: 3}

// Grade menjalankan kode terhadap semua test case dan mengembalikan
// verdict keseluruhan + hasil per test. Test "hidden" tidak membocorkan
// input / output yang diharapkan.
func Grade(ctx context.Context, runner CodeRunner, code string, tests []TestCase) (*SubmitResult, error) {
	res := &SubmitResult{Total: len(tests), Results: make([]TestResult, 0, len(tests))}
	overall := StatusAccepted

	for i, tc := range tests {
		tr := TestResult{Index: i + 1, Hidden: tc.Hidden}

		rr, err := runner.Run(ctx, code, tc.Input)
		if err != nil {
			return nil, err // masalah infrastruktur, bukan kesalahan user
		}

		switch {
		case rr.TimedOut:
			tr.Status = StatusTimeout
			tr.Error = "waktu habis (kemungkinan infinite loop atau terlalu lambat)"
		case rr.ExitCode != 0:
			tr.Status = StatusRuntime
			if !tc.Hidden {
				tr.Error = clip(strings.TrimSpace(rr.Stderr), 2000)
			}
		case normalize(rr.Stdout) == normalize(tc.Expected):
			tr.Status = StatusPassed
			res.Passed++
		default:
			tr.Status = StatusWrong
		}

		if !tc.Hidden {
			tr.Input = tc.Input
			tr.Expected = tc.Expected
			if tr.Status != StatusTimeout {
				tr.Actual = clip(rr.Stdout, 2000)
			}
		}
		res.Results = append(res.Results, tr)

		if v := verdictOf(tr.Status); severity[v] > severity[overall] {
			overall = v
		}

		if tr.Status == StatusTimeout { // jangan buang waktu server untuk test sisanya
			for j := i + 1; j < len(tests); j++ {
				res.Results = append(res.Results, TestResult{Index: j + 1, Hidden: tests[j].Hidden, Status: StatusSkipped})
			}
			break
		}
	}
	res.Status = overall
	return res, nil
}

func verdictOf(testStatus string) string {
	if testStatus == StatusPassed {
		return StatusAccepted
	}
	return testStatus
}

// normalize: samakan akhir baris (\r\n), buang spasi di ujung tiap baris
// dan baris kosong di akhir. Spasi/tab di tengah baris tetap dibandingkan.
func normalize(s string) string {
	s = strings.ReplaceAll(s, "\r\n", "\n")
	lines := strings.Split(s, "\n")
	for i := range lines {
		lines[i] = strings.TrimRight(lines[i], " \t")
	}
	return strings.TrimRight(strings.Join(lines, "\n"), "\n")
}

func clip(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
