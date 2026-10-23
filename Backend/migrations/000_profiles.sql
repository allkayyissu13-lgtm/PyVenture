-- Lewati file ini kalau tabel profiles dari diagram draw.io-mu sudah ada.
-- Backend mengharapkan minimal kolom: id (UUID), username, email, password_hash.
CREATE TABLE IF NOT EXISTS profiles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL UNIQUE,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
