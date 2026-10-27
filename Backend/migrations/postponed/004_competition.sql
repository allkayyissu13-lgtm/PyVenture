-- Fitur 2: Kompetisi & Leaderboard

CREATE TABLE IF NOT EXISTS competitions (
    id              SERIAL PRIMARY KEY,
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    penalty_minutes INT NOT NULL DEFAULT 10,   -- tambahan waktu per jawaban salah sebelum benar
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at)
);

-- Soal kontes memakai ulang tabel exercises + test_cases (penilaiannya sama).
CREATE TABLE IF NOT EXISTS competition_problems (
    id             SERIAL PRIMARY KEY,
    competition_id INT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    exercise_id    INT NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    label          TEXT NOT NULL,              -- A, B, C, ...
    points         INT NOT NULL DEFAULT 100,
    UNIQUE (competition_id, label),
    UNIQUE (competition_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS competition_submissions (
    id         BIGSERIAL PRIMARY KEY,
    problem_id INT  NOT NULL REFERENCES competition_problems(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code       TEXT NOT NULL,
    status     TEXT NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'runtime_error', 'timeout')),
    passed     INT NOT NULL,
    total      INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_sub_problem_user ON competition_submissions (problem_id, profile_id);
