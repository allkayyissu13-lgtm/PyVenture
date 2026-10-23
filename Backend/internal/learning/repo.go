package learning

import (
	"context"
	"database/sql"
	"errors"
)

var ErrNotFound = errors.New("not found")

type Repo struct{ DB *sql.DB }

// List mengembalikan daftar latihan (urut basic -> advanced) beserta status
// solved/attempted milik user. difficulty boleh kosong (= semua).
func (r *Repo) List(ctx context.Context, userID, difficulty string) ([]ExerciseSummary, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT e.id, e.slug, e.title, e.difficulty,
		       COALESCE(bool_or(s.status = 'accepted'), false) AS solved,
		       COUNT(s.id) > 0 AS attempted
		FROM exercises e
		LEFT JOIN submissions s ON s.exercise_id = e.id AND s.profile_id = $1
		WHERE ($2 = '' OR e.difficulty = $2)
		GROUP BY e.id
		ORDER BY CASE e.difficulty WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2 ELSE 3 END,
		         e.order_index, e.id`, userID, difficulty)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []ExerciseSummary{}
	for rows.Next() {
		var e ExerciseSummary
		if err := rows.Scan(&e.ID, &e.Slug, &e.Title, &e.Difficulty, &e.Solved, &e.Attempted); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

// BySlug mengambil satu latihan + contoh test (yang tidak hidden).
func (r *Repo) BySlug(ctx context.Context, slug string) (*Exercise, error) {
	var e Exercise
	err := r.DB.QueryRowContext(ctx, `
		SELECT id, slug, title, description, difficulty, starter_code
		FROM exercises WHERE slug = $1`, slug,
	).Scan(&e.ID, &e.Slug, &e.Title, &e.Description, &e.Difficulty, &e.StarterCode)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	rows, err := r.DB.QueryContext(ctx, `
		SELECT input, expected_output FROM test_cases
		WHERE exercise_id = $1 AND NOT is_hidden ORDER BY position`, e.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	e.Samples = []SampleTest{}
	for rows.Next() {
		var s SampleTest
		if err := rows.Scan(&s.Input, &s.Expected); err != nil {
			return nil, err
		}
		e.Samples = append(e.Samples, s)
	}
	return &e, rows.Err()
}

// TestCases mengambil SEMUA test (termasuk hidden) untuk keperluan penilaian.
func (r *Repo) TestCases(ctx context.Context, exerciseID int) ([]TestCase, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT input, expected_output, is_hidden FROM test_cases
		WHERE exercise_id = $1 ORDER BY position`, exerciseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []TestCase
	for rows.Next() {
		var t TestCase
		if err := rows.Scan(&t.Input, &t.Expected, &t.Hidden); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (r *Repo) SaveSubmission(ctx context.Context, userID string, exerciseID int, code string, res *SubmitResult) (int64, error) {
	var id int64
	err := r.DB.QueryRowContext(ctx, `
		INSERT INTO submissions (profile_id, exercise_id, code, status, passed, total)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		userID, exerciseID, code, res.Status, res.Passed, res.Total).Scan(&id)
	return id, err
}
