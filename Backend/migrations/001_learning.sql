-- Fitur 1: Learning (latihan Python dengan penilaian otomatis)

CREATE TABLE IF NOT EXISTS exercises (
    id           SERIAL PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    difficulty   TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    order_index  INT  NOT NULL DEFAULT 0,
    starter_code TEXT NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_cases (
    id              SERIAL PRIMARY KEY,
    exercise_id     INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    input           TEXT NOT NULL DEFAULT '',
    expected_output TEXT NOT NULL,
    is_hidden       BOOLEAN NOT NULL DEFAULT false,
    position        INT NOT NULL,
    UNIQUE (exercise_id, position)
);

CREATE TABLE IF NOT EXISTS submissions (
    id          BIGSERIAL PRIMARY KEY,
    profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id INT  NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    code        TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'runtime_error', 'timeout')),
    passed      INT NOT NULL,
    total       INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submissions_user_exercise ON submissions (profile_id, exercise_id);
