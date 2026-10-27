-- Halaman eksekusi kode: kotak Format Masukan/Keluaran + Hint Clue (maks 3)

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS input_format  TEXT NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS output_format TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS exercise_hints (
    id          SERIAL PRIMARY KEY,
    exercise_id INT  NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    position    INT  NOT NULL CHECK (position BETWEEN 1 AND 3),
    content     TEXT NOT NULL,
    UNIQUE (exercise_id, position)
);

-- Berapa hint yang sudah dibuka user pada sebuah latihan.
CREATE TABLE IF NOT EXISTS hint_usage (
    profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id INT  NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    revealed    INT  NOT NULL DEFAULT 0 CHECK (revealed BETWEEN 0 AND 3),
    PRIMARY KEY (profile_id, exercise_id)
);
