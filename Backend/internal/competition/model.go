// Package competition: Fitur 2 - kontes berwaktu + leaderboard.
package competition

import (
	"time"

	"pyventure/internal/learning"
)

const (
	StateUpcoming = "upcoming"
	StateRunning  = "running"
	StateFinished = "finished"
)

type Problem struct {
	ID          int                   `json:"-"`
	ExerciseID  int                   `json:"-"`
	Label       string                `json:"label"`
	Points      int                   `json:"points"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	StarterCode string                `json:"starter_code"`
	Samples     []learning.SampleTest `json:"samples"`
	Solved      bool                  `json:"solved"`   // milik user yang login
	Attempts    int                   `json:"attempts"` // jumlah submission user pada soal ini
}

type Competition struct {
	ID             int       `json:"id"`
	Slug           string    `json:"slug"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	StartsAt       time.Time `json:"starts_at"`
	EndsAt         time.Time `json:"ends_at"`
	PenaltyMinutes int       `json:"penalty_minutes"`
	State          string    `json:"state"`
	ProblemCount   int       `json:"problem_count"`
	Problems       []Problem `json:"problems,omitempty"` // hanya terisi setelah kontes dimulai
}

type LeaderboardEntry struct {
	Rank           int    `json:"rank"`
	Username       string `json:"username"`
	Solved         int    `json:"solved"`
	Points         int    `json:"points"`
	PenaltyMinutes int    `json:"penalty_minutes"`
	IsMe           bool   `json:"is_me"`
}

// stateAt menentukan status kontes. "now" sengaja diambil dari jam database
// (bukan jam server Go) agar konsisten dengan created_at submission.
func stateAt(now, starts, ends time.Time) string {
	switch {
	case now.Before(starts):
		return StateUpcoming
	case now.Before(ends):
		return StateRunning
	default:
		return StateFinished
	}
}
