package competition

import (
	"context"
	"database/sql"
	"errors"

	"github.com/lib/pq"

	"pyventure/internal/learning"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrNoProblem = errors.New("problem not found")
)

type Repo struct{ DB *sql.DB }

func (r *Repo) List(ctx context.Context) ([]Competition, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT c.id, c.slug, c.title, c.description, c.starts_at, c.ends_at, c.penalty_minutes,
		       now(), (SELECT COUNT(*) FROM competition_problems p WHERE p.competition_id = c.id)
		FROM competitions c
		ORDER BY c.starts_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []Competition{}
	for rows.Next() {
		var c Competition
		var now = c.StartsAt
		if err := rows.Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.StartsAt, &c.EndsAt,
			&c.PenaltyMinutes, &now, &c.ProblemCount); err != nil {
			return nil, err
		}
		c.State = stateAt(now, c.StartsAt, c.EndsAt)
		out = append(out, c)
	}
	return out, rows.Err()
}

// BySlug mengambil data kontes. Soal hanya ikut dimuat kalau kontes sudah
// dimulai (includeProblems), supaya soal tidak bocor sebelum waktunya.
func (r *Repo) BySlug(ctx context.Context, slug, userID string, includeProblems bool) (*Competition, error) {
	var c Competition
	var now = c.StartsAt
	err := r.DB.QueryRowContext(ctx, `
		SELECT c.id, c.slug, c.title, c.description, c.starts_at, c.ends_at, c.penalty_minutes,
		       now(), (SELECT COUNT(*) FROM competition_problems p WHERE p.competition_id = c.id)
		FROM competitions c WHERE c.slug = $1`, slug,
	).Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.StartsAt, &c.EndsAt,
		&c.PenaltyMinutes, &now, &c.ProblemCount)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	c.State = stateAt(now, c.StartsAt, c.EndsAt)

	if includeProblems && c.State != StateUpcoming {
		if c.Problems, err = r.problems(ctx, c.ID, userID); err != nil {
			return nil, err
		}
	}
	return &c, nil
}

func (r *Repo) problems(ctx context.Context, competitionID int, userID string) ([]Problem, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT p.id, p.exercise_id, p.label, p.points, e.title, e.description, e.starter_code,
		       COALESCE(bool_or(s.status = 'accepted'), false), COUNT(s.id)
		FROM competition_problems p
		JOIN exercises e ON e.id = p.exercise_id
		LEFT JOIN competition_submissions s ON s.problem_id = p.id AND s.profile_id = $2
		WHERE p.competition_id = $1
		GROUP BY p.id, e.id
		ORDER BY p.label`, competitionID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Problem
	var ids []int64
	for rows.Next() {
		var p Problem
		if err := rows.Scan(&p.ID, &p.ExerciseID, &p.Label, &p.Points, &p.Title, &p.Description,
			&p.StarterCode, &p.Solved, &p.Attempts); err != nil {
			return nil, err
		}
		p.Samples = []learning.SampleTest{}
		out = append(out, p)
		ids = append(ids, int64(p.ExerciseID))
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(out) == 0 {
		return out, nil
	}

	// Satu query untuk semua contoh test (bukan satu query per soal).
	srows, err := r.DB.QueryContext(ctx, `
		SELECT exercise_id, input, expected_output FROM test_cases
		WHERE exercise_id = ANY($1) AND NOT is_hidden
		ORDER BY exercise_id, position`, pq.Array(ids))
	if err != nil {
		return nil, err
	}
	defer srows.Close()

	byExercise := map[int][]learning.SampleTest{}
	for srows.Next() {
		var exID int
		var s learning.SampleTest
		if err := srows.Scan(&exID, &s.Input, &s.Expected); err != nil {
			return nil, err
		}
		byExercise[exID] = append(byExercise[exID], s)
	}
	for i := range out {
		if s := byExercise[out[i].ExerciseID]; s != nil {
			out[i].Samples = s
		}
	}
	return out, srows.Err()
}

// ProblemByLabel mencari soal berdasarkan label (A, B, ...) di dalam satu kontes.
func (r *Repo) ProblemByLabel(ctx context.Context, competitionID int, label string) (*Problem, error) {
	var p Problem
	err := r.DB.QueryRowContext(ctx, `
		SELECT id, exercise_id, label, points FROM competition_problems
		WHERE competition_id = $1 AND label = $2`, competitionID, label,
	).Scan(&p.ID, &p.ExerciseID, &p.Label, &p.Points)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNoProblem
	}
	return &p, err
}

func (r *Repo) SaveSubmission(ctx context.Context, userID string, problemID int, code string, res *learning.SubmitResult) (int64, error) {
	var id int64
	err := r.DB.QueryRowContext(ctx, `
		INSERT INTO competition_submissions (problem_id, profile_id, code, status, passed, total)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		problemID, userID, code, res.Status, res.Passed, res.Total).Scan(&id)
	return id, err
}

// Leaderboard dihitung langsung dari tabel submission setiap diminta
// (tidak ada kolom skor yang harus dijaga sinkron).
//
// Aturan:
//   - Skor soal = points soal, diberikan sekali pada submission accepted PERTAMA.
//   - Penalti soal = menit dari awal kontes sampai accepted pertama
//   - penalty_minutes x jumlah submission non-accepted SEBELUM accepted itu.
//   - Urutan: total skor besar -> kecil, lalu total penalti kecil -> besar.
//   - Peserta yang pernah submit tapi belum menyelesaikan soal tetap tampil (skor 0).
func (r *Repo) Leaderboard(ctx context.Context, competitionID int, userID string, limit int) ([]LeaderboardEntry, error) {
	rows, err := r.DB.QueryContext(ctx, `
		WITH subs AS (
			SELECT s.profile_id, s.problem_id, s.status, s.created_at
			FROM competition_submissions s
			JOIN competition_problems p ON p.id = s.problem_id
			WHERE p.competition_id = $1
		),
		first_ac AS (
			SELECT profile_id, problem_id, MIN(created_at) AS solved_at
			FROM subs WHERE status = 'accepted'
			GROUP BY profile_id, problem_id
		),
		solved AS (
			SELECT f.profile_id, p.points,
			       EXTRACT(EPOCH FROM (f.solved_at - c.starts_at)) / 60.0
			       + c.penalty_minutes * (
			           SELECT COUNT(*) FROM subs w
			           WHERE w.profile_id = f.profile_id AND w.problem_id = f.problem_id
			             AND w.status <> 'accepted' AND w.created_at < f.solved_at
			         ) AS penalty
			FROM first_ac f
			JOIN competition_problems p ON p.id = f.problem_id
			JOIN competitions c ON c.id = p.competition_id
		),
		totals AS (
			SELECT u.profile_id,
			       COUNT(s.points)               AS solved_count,
			       COALESCE(SUM(s.points), 0)    AS points,
			       COALESCE(SUM(s.penalty), 0)   AS penalty
			FROM (SELECT DISTINCT profile_id FROM subs) u
			LEFT JOIN solved s ON s.profile_id = u.profile_id
			GROUP BY u.profile_id
		)
		SELECT RANK() OVER (ORDER BY t.points DESC, t.penalty ASC) AS rank,
		       pr.username, t.solved_count, t.points, ROUND(t.penalty)::int,
		       (t.profile_id = $2)
		FROM totals t
		JOIN profiles pr ON pr.id = t.profile_id
		ORDER BY rank, pr.username
		LIMIT $3`, competitionID, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []LeaderboardEntry{}
	for rows.Next() {
		var e LeaderboardEntry
		if err := rows.Scan(&e.Rank, &e.Username, &e.Solved, &e.Points, &e.PenaltyMinutes, &e.IsMe); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}
