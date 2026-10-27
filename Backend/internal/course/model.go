// Package course: peta belajar (Level -> Stage), modul materi, catatan, dan progres.
package course

const (
	StateLocked    = "locked"
	StateUnlocked  = "unlocked"
	StateCompleted = "completed"

	// Status satu challenge (chip E1, E2, ... di halaman eksekusi kode).
	ChallengeDone    = "done"    // sudah accepted
	ChallengeCurrent = "current" // challenge yang sedang dikerjakan
	ChallengeLocked  = "locked"  // menunggu challenge sebelumnya selesai
)

// StageState = satu node di peta, lengkap dengan status milik user.
type StageState struct {
	ID               int    `json:"-"`
	LevelNumber      int    `json:"level_number"`
	LevelTitle       string `json:"-"`
	LevelDescription string `json:"-"`
	Slug             string `json:"slug"`
	Title            string `json:"title"`
	Description      string `json:"description"`
	Position         int    `json:"position"`
	State            string `json:"state"`
	ExercisesTotal   int    `json:"exercises_total"`
	ExercisesSolved  int    `json:"exercises_solved"`
	SectionsTotal    int    `json:"sections_total"`
	SectionsDone     int    `json:"sections_done"`
}

type MapLevel struct {
	Number      int          `json:"number"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	State       string       `json:"state"`
	Stages      []StageState `json:"stages"`
}

// ExerciseItem = satu challenge di dalam stage (Bab).
type ExerciseItem struct {
	ID         int    `json:"-"`
	Slug       string `json:"slug"`
	Code       string `json:"code"` // E1, E2, M1, H1 ... (huruf = tingkat, angka = urutan di tingkat itu)
	Title      string `json:"title"`
	Difficulty string `json:"difficulty"`
	XP         int    `json:"xp"`
	Solved     bool   `json:"solved"`
	Attempted  bool   `json:"attempted"`
	State      string `json:"state"` // done | current | locked
}

type StageDetail struct {
	StageState
	TrackTitle string         `json:"track_title"` // mis. "Ekspedisi Gletser Utara" (= judul level)
	Bab        int            `json:"bab"`
	Exercises  []ExerciseItem `json:"exercises"`
}

// ExerciseContext = header + bilah chip pada halaman eksekusi kode.
type ExerciseContext struct {
	TrackTitle  string         `json:"track_title"`
	LevelNumber int            `json:"level_number"`
	Bab         int            `json:"bab"`
	StageSlug   string         `json:"stage_slug"`
	StageTitle  string         `json:"stage_title"`
	Code        string         `json:"code"`
	Challenges  []ExerciseItem `json:"challenges"`
	StageLocked bool           `json:"-"`
}

type Section struct {
	ID       int    `json:"id"`
	Position int    `json:"position"`
	Title    string `json:"title"`
	Content  string `json:"content"` // Markdown
	Done     bool   `json:"done"`
	Note     string `json:"note"`
}

type Progress struct {
	TotalXP         int    `json:"total_xp"`
	ExercisesSolved int    `json:"exercises_solved"`
	SectionsDone    int    `json:"sections_done"`
	StagesCompleted int    `json:"stages_completed"`
	StagesTotal     int    `json:"stages_total"`
	CurrentStage    string `json:"current_stage"` // slug stage berikutnya yang harus dikerjakan ("" jika semua selesai)
}

// GroupByLevel mengelompokkan stage (yang sudah terurut) menjadi level.
// Status level: completed jika semua stage selesai, locked jika stage
// pertamanya terkunci, selain itu unlocked.
func GroupByLevel(stages []StageState) []MapLevel {
	levels := []MapLevel{}
	for _, s := range stages {
		if n := len(levels); n == 0 || levels[n-1].Number != s.LevelNumber {
			levels = append(levels, MapLevel{
				Number: s.LevelNumber, Title: s.LevelTitle, Description: s.LevelDescription,
				Stages: []StageState{},
			})
		}
		l := &levels[len(levels)-1]
		l.Stages = append(l.Stages, s)
	}
	for i := range levels {
		l := &levels[i]
		allDone := true
		for _, s := range l.Stages {
			if s.State != StateCompleted {
				allDone = false
			}
		}
		switch {
		case allDone:
			l.State = StateCompleted
		case l.Stages[0].State == StateLocked:
			l.State = StateLocked
		default:
			l.State = StateUnlocked
		}
	}
	return levels
}
