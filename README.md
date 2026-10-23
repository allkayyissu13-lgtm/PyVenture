# PyVenture Backend (Go)

## Menjalankan
1. Jalankan SQL di `migrations/` berurutan lewat Supabase SQL Editor
   (`000` lewati jika tabel `profiles` sudah ada).
2. `cp .env.example .env`, isi `DATABASE_URL` dan `JWT_SECRET`.
3. `go mod tidy`
4. `set -a; source .env; set +a; go run .`
5. Tes: `go test ./...` (butuh `python3` terpasang)

## Endpoint
| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | /api/auth/register | - | buat akun, mengembalikan JWT |
| POST | /api/auth/login | - | login, mengembalikan JWT |
| GET | /api/exercises?difficulty= | JWT | daftar latihan + status solved/attempted |
| GET | /api/exercises/{slug} | JWT | detail latihan + contoh test |
| POST | /api/exercises/{slug}/submit | JWT | nilai kode `{"code": "..."}` |

## Catatan keamanan (penting)
`PythonRunner` menjalankan kode user langsung di server: ada timeout, batas
output, env bersih, dan batas eksekusi paralel, tetapi BUKAN sandbox penuh
(kode user masih bisa membaca file / membuka jaringan). Untuk publik, jalankan
di container tanpa jaringan dengan batas memori/CPU, atau ganti `CodeRunner`
dengan sandbox/Pyodide.
