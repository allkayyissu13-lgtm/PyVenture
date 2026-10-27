package course

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
)

var ErrNotFound = errors.New("not found")

type Repo struct{ DB *sql.DB }

// states menghitung status SEMUA stage milik satu user dalam satu query.
//
// Urutan global stage = (nomor level, posisi stage). Aturan:
//   - stage pertama selalu terbuka;
//   - stage berikutnya terbuka kalau stage sebelumnya (LAG) sudah selesai;
//   - stage selesai bila semua studi kasusnya sudah accepted; kalau stage tidak
//     punya studi kasus, selesai bila semua sub-materinya sudah ditandai; kalau
//     kosong dua-duanya, dianggap selesai agar tidak menghalangi jalur.
func (r *Repo) states(ctx context.Context, userID string) ([]StageState, error) {
	rows, err := r.DB.QueryContext(ctx, `
		WITH ordered AS (
			SELECT s.id, s.slug, s.title, s.description, s.position,
			       l.number AS level_number, l.title AS level_title, l.description AS level_description,
			       ROW_NUMBER() OVER (ORDER BY l.number, s.position) AS seq
			FROM stages s JOIN levels l ON l.id = s.level_id
		),
		solved_ex AS (
			SELECT DISTINCT exercise_id FROM submissions
			WHERE profile_id = $1 AND status = 'accepted'
		),
		ex AS (
			SELECT e.stage_id, COUNT(*) AS total, COUNT(se.exercise_id) AS solved
			FROM exercises e LEFT JOIN solved_ex se ON se.exercise_id = e.id
			WHERE e.stage_id IS NOT NULL
			GROUP BY e.stage_id
		),
		sec AS (
			SELECT ms.stage_id, COUNT(*) AS total, COUNT(sp.completed_at) AS done
			FROM module_sections ms
			LEFT JOIN section_progress sp ON sp.section_id = ms.id AND sp.profile_id = $1
			GROUP BY ms.stage_id
		),
		stat AS (
			SELECT o.*,
			       COALESCE(ex.total, 0)  AS ex_total,  COALESCE(ex.solved, 0) AS ex_solved,
			       COALESCE(sec.total, 0) AS sec_total, COALESCE(sec.done, 0)  AS sec_done
			FROM ordered o
			LEFT JOIN ex  ON ex.stage_id  = o.id
			LEFT JOIN sec ON sec.stage_id = o.id
		),
		fin AS (
			SELECT stat.*,
			       CASE WHEN ex_total  > 0 THEN ex_solved = ex_total
			            WHEN sec_total > 0 THEN sec_done  = sec_total
			            ELSE true END AS completed
			FROM stat
		)
		SELECT level_number, level_title, level_description, id, slug, title, description, position,
		       ex_total, ex_solved, sec_total, sec_done, completed,
		       COALESCE(LAG(completed) OVER (ORDER BY seq), true) AS prev_completed
		FROM fin ORDER BY seq`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []StageState{}
	for rows.Next() {
		var s StageState
		var completed, prevCompleted bool
		if err := rows.Scan(&s.LevelNumber, &s.LevelTitle, &s.LevelDescription, &s.ID, &s.Slug, &s.Title,
			&s.Description, &s.Position, &s.ExercisesTotal, &s.ExercisesSolved, &s.SectionsTotal,
			&s.SectionsDone, &completed, &prevCompleted); err != nil {
			return nil, err
		}
		switch {
		case !prevCompleted:
			s.State = StateLocked
		case completed:
			s.State = StateCompleted
		default:
			s.State = StateUnlocked
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *Repo) Map(ctx context.Context, userID string) ([]MapLevel, error) {
	st, err := r.states(ctx, userID)
	if err != nil {
		return nil, err
	}
	return GroupByLevel(st), nil
}

func (r *Repo) StageBySlug(ctx context.Context, userID, slug string) (*StageState, error) {
	st, err := r.states(ctx, userID)
	if err != nil {
		return nil, err
	}
	for i := range st {
		if st[i].Slug == slug {
			return &st[i], nil
		}
	}
	return nil, ErrNotFound
}

var tierLetter = map[string]string{"beginner": "E", "intermediate": "M", "advanced": "H"}

// Challenges mengembalikan semua challenge sebuah stage, diurutkan per tingkat
// (E -> M -> H) lalu urutan latihan, lengkap dengan kode (E1, E2, M1, ...) dan status.
//
// Aturan kunci berurutan: challenge yang sudah accepted = done; yang pertama belum
// selesai = current; sisanya = locked. Jika stage-nya sendiri terkunci, semua locked.
func (r *Repo) Challenges(ctx context.Context, userID string, stageID int, stageLocked bool) ([]ExerciseItem, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT e.id, e.slug, e.title, e.difficulty, e.xp,
		       COALESCE(bool_or(s.status = 'accepted'), false), COUNT(s.id) > 0
		FROM exercises e
		LEFT JOIN submissions s ON s.exercise_id = e.id AND s.profile_id = $2
		WHERE e.stage_id = $1
		GROUP BY e.id
		ORDER BY CASE e.difficulty WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2 ELSE 3 END,
		         e.order_index, e.id`, stageID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []ExerciseItem{}
	perTier := map[string]int{}
	foundCurrent := false
	for rows.Next() {
		var it ExerciseItem
		if err := rows.Scan(&it.ID, &it.Slug, &it.Title, &it.Difficulty, &it.XP, &it.Solved, &it.Attempted); err != nil {
			return nil, err
		}
		letter := tierLetter[it.Difficulty]
		perTier[letter]++
		it.Code = letter + strconv.Itoa(perTier[letter])

		switch {
		case stageLocked:
			it.State = ChallengeLocked
		case it.Solved:
			it.State = ChallengeDone
		case !foundCurrent:
			it.State = ChallengeCurrent
			foundCurrent = true
		default:
			it.State = ChallengeLocked
		}
		out = append(out, it)
	}
	return out, rows.Err()
}

// ExerciseContext menyusun data header halaman eksekusi kode untuk satu latihan.
func (r *Repo) ExerciseContext(ctx context.Context, userID, exerciseSlug string) (*ExerciseContext, error) {
	var stageID sql.NullInt64
	err := r.DB.QueryRowContext(ctx, `SELECT stage_id FROM exercises WHERE slug = $1`, exerciseSlug).Scan(&stageID)
	if errors.Is(err, sql.ErrNoRows) || (err == nil && !stageID.Valid) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	states, err := r.states(ctx, userID)
	if err != nil {
		return nil, err
	}
	var st *StageState
	for i := range states {
		if states[i].ID == int(stageID.Int64) {
			st = &states[i]
		}
	}
	if st == nil {
		return nil, ErrNotFound
	}

	locked := st.State == StateLocked
	chs, err := r.Challenges(ctx, userID, st.ID, locked)
	if err != nil {
		return nil, err
	}
	c := &ExerciseContext{
		TrackTitle: st.LevelTitle, LevelNumber: st.LevelNumber, Bab: st.Position,
		StageSlug: st.Slug, StageTitle: st.Title, Challenges: chs, StageLocked: locked,
	}
	for _, it := range chs {
		if it.Slug == exerciseSlug {
			c.Code = it.Code
		}
	}
	return c, nil
}

func (r *Repo) Sections(ctx context.Context, userID string, stageID int) ([]Section, error) {
	rows, err := r.DB.QueryContext(ctx, `
		SELECT ms.id, ms.position, ms.title, ms.content,
		       COALESCE(sp.completed_at IS NOT NULL, false), COALESCE(sp.note, '')
		FROM module_sections ms
		LEFT JOIN section_progress sp ON sp.section_id = ms.id AND sp.profile_id = $2
		WHERE ms.stage_id = $1
		ORDER BY ms.position`, stageID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []Section{}
	for rows.Next() {
		var s Section
		if err := rows.Scan(&s.ID, &s.Position, &s.Title, &s.Content, &s.Done, &s.Note); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

// SectionStageID mengembalikan stage pemilik sebuah sub-materi.
func (r *Repo) SectionStageID(ctx context.Context, sectionID int) (int, error) {
	var stageID int
	err := r.DB.QueryRowContext(ctx, `SELECT stage_id FROM module_sections WHERE id = $1`, sectionID).Scan(&stageID)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, ErrNotFound
	}
	return stageID, err
}

// StageUnlocked dipakai handler Note/Complete agar sub-materi stage yang
// masih terkunci tidak bisa dimanipulasi.
func (r *Repo) StageUnlocked(ctx context.Context, userID string, stageID int) (bool, error) {
	st, err := r.states(ctx, userID)
	if err != nil {
		return false, err
	}
	for _, s := range st {
		if s.ID == stageID {
			return s.State != StateLocked, nil
		}
	}
	return false, ErrNotFound
}

// ExerciseUnlocked memenuhi interface learning.Gate. Sebuah latihan boleh dibuka
// bila stage-nya terbuka DAN challenge-nya tidak berstatus locked (challenge
// sebelumnya di stage itu sudah selesai). Latihan tanpa stage bebas.
func (r *Repo) ExerciseUnlocked(ctx context.Context, userID string, exerciseID int) (bool, error) {
	var stageID sql.NullInt64
	err := r.DB.QueryRowContext(ctx, `SELECT stage_id FROM exercises WHERE id = $1`, exerciseID).Scan(&stageID)
	if err != nil {
		return false, err
	}
	if !stageID.Valid {
		return true, nil
	}
	open, err := r.StageUnlocked(ctx, userID, int(stageID.Int64))
	if err != nil || !open {
		return false, err
	}
	items, err := r.Challenges(ctx, userID, int(stageID.Int64), false)
	if err != nil {
		return false, err
	}
	for _, it := range items {
		if it.ID == exerciseID {
			return it.State != ChallengeLocked, nil
		}
	}
	return false, nil
}

// SaveNote = upsert: baris dibuat kalau belum ada, kalau sudah ada hanya catatannya yang berubah.
func (r *Repo) SaveNote(ctx context.Context, userID string, sectionID int, note string) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO section_progress (profile_id, section_id, note)
		VALUES ($1, $2, $3)
		ON CONFLICT (profile_id, section_id)
		DO UPDATE SET note = EXCLUDED.note, updated_at = now()`, userID, sectionID, note)
	return err
}

// CompleteSection idempotent: menandai berkali-kali tidak mengubah waktu selesai pertama.
func (r *Repo) CompleteSection(ctx context.Context, userID string, sectionID int) error {
	_, err := r.DB.ExecContext(ctx, `
		INSERT INTO section_progress (profile_id, section_id, completed_at)
		VALUES ($1, $2, now())
		ON CONFLICT (profile_id, section_id)
		DO UPDATE SET completed_at = COALESCE(section_progress.completed_at, now()), updated_at = now()`,
		userID, sectionID)
	return err
}

func (r *Repo) Progress(ctx context.Context, userID string) (*Progress, error) {
	p := &Progress{}
	err := r.DB.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(e.xp), 0), COUNT(*)
		FROM exercises e
		WHERE EXISTS (SELECT 1 FROM submissions s
		              WHERE s.exercise_id = e.id AND s.profile_id = $1 AND s.status = 'accepted')`, userID,
	).Scan(&p.TotalXP, &p.ExercisesSolved)
	if err != nil {
		return nil, err
	}
	err = r.DB.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM section_progress WHERE profile_id = $1 AND completed_at IS NOT NULL`, userID,
	).Scan(&p.SectionsDone)
	if err != nil {
		return nil, err
	}

	st, err := r.states(ctx, userID)
	if err != nil {
		return nil, err
	}
	p.StagesTotal = len(st)
	for _, s := range st {
		switch {
		case s.State == StateCompleted:
			p.StagesCompleted++
		case s.State == StateUnlocked && p.CurrentStage == "":
			p.CurrentStage = s.Slug
		}
	}
	return p, nil
}
