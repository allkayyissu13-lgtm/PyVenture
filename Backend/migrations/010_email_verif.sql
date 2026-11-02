-- Verifikasi email dengan kode 6 digit.
-- Aman dijalankan ulang: akun yang SUDAH ada sebelum migrasi ini dianggap terverifikasi
-- (hanya saat kolom pertama kali dibuat), akun baru harus verifikasi.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified_at TIMESTAMPTZ;
    UPDATE profiles SET email_verified_at = now();
  END IF;
END $$;

-- Satu baris per user: kode terbaru saja (kirim ulang = menimpa baris ini).
CREATE TABLE IF NOT EXISTS email_verifications (
    profile_id   UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    code_hash    TEXT        NOT NULL,                -- HMAC dari kode, bukan kode asli
    expires_at   TIMESTAMPTZ NOT NULL,
    attempts     INT         NOT NULL DEFAULT 0,      -- batas salah tebak
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now()   -- untuk jeda kirim ulang
);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;