# PyVenture Backend (Go)

Fokus saat ini: **Peta Level/Stage**, **Modul** (materi + catatan), dan **Learning** (studi kasus Python
dengan penilaian otomatis). Kompetisi & Leaderboard ditunda.

## Menjalankan
1. Jalankan SQL di `migrations/` berurutan lewat Supabase SQL Editor:
   `000` (lewati jika `profiles` sudah ada), `001`, `002`, `003`, `006`, `007`, `008`, `009`.
   Yang sudah pernah dijalankan boleh dilewati.
   File di `migrations/postponed/` (kompetisi) TIDAK perlu dijalankan.
2. Isi environment variable `DATABASE_URL` dan `JWT_SECRET` (lihat `.env.example`).
3. `go mod tidy` lalu `go run .`
   Di Windows, backend memakai perintah `python` (bukan `python3`); ganti dengan `PYTHON_BIN` jika perlu
   (mis. `py`). Pengukuran memori di panel Terminal hanya tersedia di Linux; di Windows nilainya 0
   (tampilkan "-" di UI).
4. Tes: `go test ./...` (butuh `python3` terpasang)

## Endpoint (semua kecuali auth butuh header `Authorization: Bearer <token>`)
| Method | Path | Fungsi |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | akun + JWT |
| GET | /api/map | peta belajar: level -> stage + status locked/unlocked/completed |
| GET | /api/stages/{slug} | halaman stage: daftar studi kasus (403 jika terkunci) |
| GET | /api/stages/{slug}/module | materi stage: sub-materi, status baca, catatan milikmu |
| PUT | /api/sections/{id}/note | simpan catatan `{"note": "..."}` (tombol Save) |
| POST | /api/sections/{id}/complete | tandai sub-materi sudah dibaca |
| GET | /api/me/progress | total XP, latihan selesai, stage selesai, stage berikutnya |
| GET | /api/exercises/{slug} | isi halaman eksekusi kode: soal, format masukan/keluaran, contoh, hint yang sudah dibuka |
| GET | /api/exercises/{slug}/context | header halaman: track, Bab, kode challenge (E3), chip E1/E2/E3/M1 + statusnya |
| POST | /api/exercises/{slug}/run | tombol Jalankan Kode: `{"code": "...", "stdin": "..."}` (stdin opsional), tidak dinilai/disimpan; hasil: stdout, stderr, time_ms, memory_kb |
| POST | /api/exercises/{slug}/submit | tombol Submit Solusi: dinilai terhadap semua test dan disimpan |
| POST | /api/exercises/{slug}/hints/next | tombol Hint Clue: buka satu hint lagi (maks 3) |
(Detail/run/submit/hint mengembalikan 403 jika stage atau challenge-nya masih terkunci.)
| GET | /api/exercises?difficulty= | daftar semua latihan (versi lama) |

## Aturan peta
- Urutan stage = (nomor level, posisi stage). Stage pertama selalu terbuka.
- Stage berikutnya terbuka setelah stage sebelumnya **selesai**.
- Stage selesai = semua studi kasusnya accepted (jika tidak ada studi kasus: semua sub-materi ditandai).
- Membaca materi tidak membuka stage; hanya menyelesaikan studi kasus.
- Di dalam stage (Bab), challenge berurutan per tingkat: E (beginner) -> M (intermediate) -> H (advanced),
  lalu urutan latihan. Challenge pertama yang belum accepted = `current`, sisanya `locked`.
- XP diberikan sekali per studi kasus pada accepted pertama (10/20/30/40 per level).

## Menambah konten sendiri
Level, stage, sub-materi (Markdown), dan studi kasus saat ini diisi lewat SQL
(contoh lengkap di `migrations/007_seed_curriculum.sql`).

## Catatan keamanan (penting)
`PythonRunner` menjalankan kode user langsung di server: ada timeout, batas output, env bersih,
dan batas eksekusi paralel, tetapi BUKAN sandbox penuh (kode user masih bisa membaca file /
membuka jaringan). Untuk publik, jalankan di container tanpa jaringan dengan batas
memori/CPU, atau ganti `CodeRunner` dengan sandbox/Pyodide.
