-- Peta belajar (Level -> Stage) + Modul (materi per stage, catatan, progres baca)

CREATE TABLE IF NOT EXISTS levels (
    id          SERIAL PRIMARY KEY,
    number      INT  NOT NULL UNIQUE,          -- Level 1..4
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS stages (
    id          SERIAL PRIMARY KEY,
    level_id    INT  NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INT  NOT NULL,                 -- urutan node di dalam level
    UNIQUE (level_id, position)
);

-- Studi kasus (latihan) milik sebuah stage + XP yang didapat saat pertama kali accepted.
-- stage_id NULL = latihan lepas (tidak terkunci).
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS stage_id INT REFERENCES stages(id) ON DELETE SET NULL;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 10;
CREATE INDEX IF NOT EXISTS idx_exercises_stage ON exercises (stage_id);

-- Modul = materi sebuah stage; satu baris = satu sub-materi (isi berupa Markdown).
CREATE TABLE IF NOT EXISTS module_sections (
    id       SERIAL PRIMARY KEY,
    stage_id INT  NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    position INT  NOT NULL,
    title    TEXT NOT NULL,
    content  TEXT NOT NULL,
    UNIQUE (stage_id, position)
);

-- Progres per user per sub-materi: sudah dibaca (completed_at) + catatan pribadi.
CREATE TABLE IF NOT EXISTS section_progress (
    profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    section_id   INT  NOT NULL REFERENCES module_sections(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ,
    note         TEXT NOT NULL DEFAULT '',
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (profile_id, section_id),
    CHECK (length(note) <= 5000)
);
