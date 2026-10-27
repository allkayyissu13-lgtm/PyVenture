-- Soal kontes disembunyikan dari fitur Learning (is_public = false)
-- supaya tidak bisa dibaca / dikerjakan di luar kontes.
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;
