package course

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"time"
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

func calcLevel(xp int) (level int, xpMax int, pct int) {
	thresholds := []int{100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000}
	prev := 0
	for i, t := range thresholds {
		if xp < t {
			level = i + 1
			xpMax = t
			span := t - prev
			cur := xp - prev
			if span > 0 {
				pct = (cur * 100) / span
			}
			return
		}
		prev = t
	}
	level = len(thresholds) + 1
	xpMax = prev + 1000
	pct = 100
	return
}

func formatNumber(n int) string {
	in := strconv.Itoa(n)
	if len(in) <= 3 {
		return in
	}
	var out []byte
	rem := len(in) % 3
	if rem > 0 {
		out = append(out, in[:rem]...)
		if len(in) > rem {
			out = append(out, ',')
		}
	}
	for i := rem; i < len(in); i += 3 {
		out = append(out, in[i:i+3]...)
		if i+3 < len(in) {
			out = append(out, ',')
		}
	}
	return string(out)
}

func (r *Repo) Dashboard(ctx context.Context, userID string) (*DashboardData, error) {
	// 1. User profile
	var username string
	err := r.DB.QueryRowContext(ctx, `SELECT username FROM profiles WHERE id = $1`, userID).Scan(&username)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	// 2. XP & Solved exercises
	var totalXP, exercisesSolved int
	err = r.DB.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(e.xp), 0), COUNT(DISTINCT e.id)
		FROM exercises e
		WHERE EXISTS (
			SELECT 1 FROM submissions s
			WHERE s.exercise_id = e.id AND s.profile_id = $1 AND s.status = 'accepted'
		)`, userID).Scan(&totalXP, &exercisesSolved)
	if err != nil {
		return nil, err
	}

	var totalExercises int
	_ = r.DB.QueryRowContext(ctx, `SELECT COUNT(*) FROM exercises`).Scan(&totalExercises)
	if totalExercises == 0 {
		totalExercises = 11
	}

	// 3. Submissions count & accuracy
	var totalSubs, acceptedSubs int
	_ = r.DB.QueryRowContext(ctx, `
		SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'accepted')
		FROM submissions WHERE profile_id = $1`, userID).Scan(&totalSubs, &acceptedSubs)

	accuracyPct := 100
	if totalSubs > 0 {
		accuracyPct = (acceptedSubs * 100) / totalSubs
	}

	// 4. Streak
	streakDays := 1
	rows, err := r.DB.QueryContext(ctx, `
		WITH act AS (
			SELECT DISTINCT DATE(created_at AT TIME ZONE 'UTC') AS d
			FROM submissions WHERE profile_id = $1
			UNION
			SELECT DISTINCT DATE(completed_at AT TIME ZONE 'UTC') AS d
			FROM section_progress WHERE profile_id = $1 AND completed_at IS NOT NULL
		)
		SELECT d FROM act ORDER BY d DESC`, userID)
	if err == nil {
		defer rows.Close()
		var dates []time.Time
		for rows.Next() {
			var t time.Time
			if err := rows.Scan(&t); err == nil {
				dates = append(dates, t)
			}
		}
		if len(dates) > 0 {
			now := time.Now().UTC().Truncate(24 * time.Hour)
			diff := int(now.Sub(dates[0]).Hours() / 24)
			if diff <= 1 {
				curStreak := 1
				curDate := dates[0]
				for i := 1; i < len(dates); i++ {
					prevDate := dates[i]
					if int(curDate.Sub(prevDate).Hours()/24) == 1 {
						curStreak++
						curDate = prevDate
					} else {
						break
					}
				}
				streakDays = curStreak
			} else {
				streakDays = 0
			}
		}
	}

	// 5. Level & Level progress
	level, xpMax, levelProgressPct := calcLevel(totalXP)

	// 6. Stages progress & Active Quest
	st, err := r.states(ctx, userID)
	if err != nil {
		return nil, err
	}
	stagesCompleted := 0
	var currentUnlockedStage *StageState
	for i := range st {
		if st[i].State == StateCompleted {
			stagesCompleted++
		} else if st[i].State == StateUnlocked && currentUnlockedStage == nil {
			currentUnlockedStage = &st[i]
		}
	}

	quest := DashboardQuest{
		Active:        true,
		Tag:           "Expedition Quest",
		TrackTitle:    "Ekspedisi Python",
		StageTitle:    "Modul Belajar",
		ExerciseTitle: "Jelajahi Quest",
		Link:          "/quest",
	}

	if currentUnlockedStage != nil {
		quest.StageSlug = currentUnlockedStage.Slug
		quest.StageTitle = currentUnlockedStage.Title
		quest.TrackTitle = currentUnlockedStage.LevelTitle

		var exSlug, exTitle string
		err := r.DB.QueryRowContext(ctx, `
			SELECT e.slug, e.title
			FROM exercises e
			WHERE e.stage_id = $1
			  AND NOT EXISTS (
				  SELECT 1 FROM submissions sub
				  WHERE sub.exercise_id = e.id AND sub.profile_id = $2 AND sub.status = 'accepted'
			  )
			ORDER BY e.order_index ASC, e.id ASC
			LIMIT 1`, currentUnlockedStage.ID, userID).Scan(&exSlug, &exTitle)
		if err == nil {
			quest.ExerciseSlug = exSlug
			quest.ExerciseTitle = exTitle
			quest.Link = "/quest"
		} else {
			quest.ExerciseTitle = "Pelajari Materi: " + currentUnlockedStage.Title
			quest.Link = "/modul/" + currentUnlockedStage.Slug
		}
	} else if stagesCompleted == len(st) && len(st) > 0 {
		quest.Active = false
		quest.Tag = "Ekspedisi Tuntas"
		quest.TrackTitle = "Semua Bab Telah Ditaklukkan"
		quest.StageTitle = "Selamat Petualang!"
		quest.ExerciseTitle = "Kamu telah menyelesaikan semua modul."
		quest.Link = "/modul"
	}

	// 7. Badges
	badges := []DashboardBadge{
		{
			Level: 1, Name: "Novice", XP: "+50", Tone: "blue", Icon: "code",
			Done: exercisesSolved >= 1, Progress: min(exercisesSolved, 1), Total: 1,
		},
		{
			Level: 2, Name: "Apprentice", XP: "+120", Tone: "copper", Icon: "star", Hot: true,
			Done: exercisesSolved >= 3, Progress: min(exercisesSolved, 3), Total: 3,
		},
		{
			Level: 3, Name: "Coder", XP: "+200", Tone: "steel", Icon: "shield",
			Done: totalXP >= 100, Progress: min(totalXP, 100), Total: 100,
		},
		{
			Level: 4, Name: "Expert", XP: "+250", Tone: "blue", Icon: "bolt",
			Done: stagesCompleted >= 1, Progress: min(stagesCompleted, 1), Total: 1,
		},
		{
			Level: 5, Name: "Master", XP: "+300", Tone: "copper", Icon: "star", Hot: true,
			Done: stagesCompleted >= 3, Progress: min(stagesCompleted, 3), Total: 3,
		},
		{
			Level: 6, Name: "Grandmaster", XP: "+500", Tone: "locked", Icon: "lock",
			Done: totalXP >= 500, Progress: min(totalXP, 500), Total: 500,
		},
	}

	// 8. Stats
	stats := []DashboardStat{
		{Label: "Total Poin", Value: strconv.Itoa(totalXP), Note: "Total XP", Icon: "bolt"},
		{Label: "Streak", Value: fmt.Sprintf("%d Hari", streakDays), Note: "Aktif berturut", Icon: "flame", Hot: true},
		{Label: "Akurasi", Value: fmt.Sprintf("%d%%", accuracyPct), Note: fmt.Sprintf("%d / %d Submisi", acceptedSubs, totalSubs), Icon: "target"},
		{Label: "Quest", Value: strconv.Itoa(exercisesSolved), Note: fmt.Sprintf("/ %d Latihan", totalExercises), Icon: "check"},
	}

	// 9. Leaderboard
	leaderboard, err := r.Leaderboard(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &DashboardData{
		User: DashboardUser{
			Name:             username,
			Handle:           "@" + username,
			Level:            level,
			XP:               totalXP,
			XPMax:            xpMax,
			LevelProgressPct: levelProgressPct,
		},
		Stats:       stats,
		Quest:       quest,
		Badges:      badges,
		Leaderboard: *leaderboard,
	}, nil
}

func (r *Repo) Leaderboard(ctx context.Context, userID string) (*DashboardLeaderboard, error) {
	rows, err := r.DB.QueryContext(ctx, `
		WITH user_xp AS (
			SELECT p.id::text AS id, p.username,
			       COALESCE(SUM(e.xp), 0)::int AS xp
			FROM profiles p
			LEFT JOIN (
				SELECT DISTINCT profile_id, exercise_id
				FROM submissions
				WHERE status = 'accepted'
			) s ON s.profile_id = p.id
			LEFT JOIN exercises e ON e.id = s.exercise_id
			GROUP BY p.id, p.username
		),
		ranked AS (
			SELECT id, username, xp,
			       DENSE_RANK() OVER (ORDER BY xp DESC, username ASC) AS rnk
			FROM user_xp
		)
		SELECT id, username, xp, rnk
		FROM ranked
		ORDER BY rnk, username
		LIMIT 20`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type rawEntry struct {
		id       string
		username string
		xp       int
		rank     int
	}
	var entries []rawEntry
	for rows.Next() {
		var e rawEntry
		if err := rows.Scan(&e.id, &e.username, &e.xp, &e.rank); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}

	// Jika profil di DB kurang dari 3, tambahkan peserta benchmark ekspedisi
	// agar podium 1, 2, 3 selalu terisi secara estetis.
	benchmarks := []struct {
		username string
		xp       int
	}{
		{"Sihotang", 4890},
		{"Fauzi", 4120},
		{"Azahra", 3990},
		{"Lionel Ashley", 3710},
		{"Dzakwan Hibrizi", 3640},
		{"Barra Allapydya", 3510},
	}
	if len(entries) < 3 {
		usedNames := map[string]bool{}
		for _, e := range entries {
			usedNames[e.username] = true
		}
		for _, b := range benchmarks {
			if !usedNames[b.username] {
				entries = append(entries, rawEntry{
					id:       "",
					username: b.username,
					xp:       b.xp,
					rank:     len(entries) + 1,
				})
			}
			if len(entries) >= 8 {
				break
			}
		}
	}

	var rank1, rank2, rank3 LeaderboardItem
	rankingList := []LeaderboardItem{}

	for _, e := range entries {
		item := LeaderboardItem{
			Rank: e.rank,
			Name: e.username,
			XP:   formatNumber(e.xp),
			Me:   e.id != "" && e.id == userID,
		}
		if item.Me {
			item.Note = "Peringkat Kamu"
		}
		switch e.rank {
		case 1:
			if item.Note == "" {
				item.Note = "Top Coder"
			}
			rank1 = item
		case 2:
			rank2 = item
		case 3:
			rank3 = item
		default:
			rankingList = append(rankingList, item)
		}
	}

	podium := []LeaderboardItem{}
	if rank2.Name != "" {
		podium = append(podium, rank2)
	}
	if rank1.Name != "" {
		podium = append(podium, rank1)
	}
	if rank3.Name != "" {
		podium = append(podium, rank3)
	}

	return &DashboardLeaderboard{
		Podium:  podium,
		Ranking: rankingList,
	}, nil
}
