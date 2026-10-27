package course

import "testing"

func st(level int, state string) StageState {
	return StageState{LevelNumber: level, LevelTitle: "L", State: state}
}

func TestGroupByLevelStates(t *testing.T) {
	levels := GroupByLevel([]StageState{
		st(1, StateCompleted), st(1, StateCompleted), // level 1 selesai
		st(2, StateCompleted), st(2, StateUnlocked), // level 2 sedang berjalan
		st(3, StateLocked), // level 3 terkunci
	})
	want := []string{StateCompleted, StateUnlocked, StateLocked}
	if len(levels) != 3 {
		t.Fatalf("jumlah level = %d", len(levels))
	}
	for i, w := range want {
		if levels[i].State != w {
			t.Errorf("level %d state = %s, want %s", i+1, levels[i].State, w)
		}
	}
	if len(levels[0].Stages) != 2 || len(levels[1].Stages) != 2 {
		t.Errorf("stage salah kelompok: %+v", levels)
	}
}

func TestGroupByLevelEmpty(t *testing.T) {
	if got := GroupByLevel(nil); got == nil || len(got) != 0 {
		t.Fatalf("harus slice kosong (bukan nil) agar JSON = [] : %#v", got)
	}
}
