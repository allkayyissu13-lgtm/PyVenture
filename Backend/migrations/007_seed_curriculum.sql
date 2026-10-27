-- Isi kurikulum contoh: 4 level, 6 stage, 11 sub-materi, 11 studi kasus.
-- Aman dijalankan ulang (kecuali urutan/XP latihan akan dikembalikan ke nilai di bawah).

INSERT INTO levels (number, title, description) VALUES
(1, 'Dasar Python',  'Output, input, variabel, dan operasi dasar.'),
(2, 'Alur Program',  'Percabangan dan perulangan.'),
(3, 'Struktur Data', 'List dan fungsi.'),
(4, 'Studi Kasus',   'Mengolah teks dengan struktur data.')
ON CONFLICT (number) DO NOTHING;

INSERT INTO stages (level_id, slug, title, description, position)
SELECT l.id, v.slug, v.title, v.descr, v.pos
FROM (VALUES
  (1, 'halo-python',      'Halo, Python!',        'Mencetak teks dan membaca input.',               1),
  (1, 'operasi-dasar',    'Operasi Dasar',        'Tipe data dan operator aritmetika.',             2),
  (2, 'percabangan',      'Percabangan',          'Mengambil keputusan dengan if.',                 1),
  (2, 'perulangan',       'Perulangan',           'Mengulang pekerjaan dengan for dan while.',      2),
  (3, 'list-dan-fungsi',  'List dan Fungsi',      'Menyimpan banyak nilai dan membuat fungsi.',     1),
  (4, 'studi-kasus-teks', 'Studi Kasus: Teks',    'Mengolah kalimat dan kata.',                     1)
) AS v(lvl, slug, title, descr, pos)
JOIN levels l ON l.number = v.lvl
ON CONFLICT (slug) DO NOTHING;

-- ---------- Modul (isi Markdown) ----------
INSERT INTO module_sections (stage_id, position, title, content)
SELECT s.id, v.pos, v.title, v.content
FROM (VALUES
('halo-python', 1, 'Mencetak dengan print()', $md$
`print()` menampilkan nilai ke layar.

```python
print("Halo, dunia!")
print("Umur:", 17)
```

Teks ditulis di dalam tanda kutip. Beberapa nilai boleh dipisah koma.
$md$),
('halo-python', 2, 'Membaca input dan variabel', $md$
`input()` membaca satu baris teks dari pengguna. Hasilnya disimpan dalam **variabel**.

```python
nama = input()
print("Halo,", nama)
```

Variabel adalah nama untuk sebuah nilai. Isinya bisa diganti kapan saja.
$md$),
('operasi-dasar', 1, 'Tipe data dan operator', $md$
Tipe data yang paling sering dipakai: `int` (bilangan bulat), `float` (desimal), `str` (teks).

| Operator | Arti | Contoh |
|---|---|---|
| `+` `-` `*` | tambah, kurang, kali | `3 * 4` -> `12` |
| `/` | bagi (hasil desimal) | `7 / 2` -> `3.5` |
| `//` | bagi bulat | `7 // 2` -> `3` |
| `%` | sisa bagi | `7 % 2` -> `1` |
$md$),
('operasi-dasar', 2, 'Konversi tipe', $md$
`input()` selalu menghasilkan teks. Ubah ke angka dengan `int()` sebelum menghitung.

```python
a = int(input())
b = int(input())
print(a + b)
```

Tanpa `int()`, `"2" + "3"` menghasilkan `"23"` (teks digabung), bukan `5`.
$md$),
('percabangan', 1, 'if, elif, else', $md$
Program memilih jalur berdasarkan kondisi.

```python
n = int(input())
if n % 2 == 0:
    print("genap")
elif n < 0:
    print("negatif ganjil")
else:
    print("ganjil")
```

Perhatikan titik dua `:` dan **indentasi** (4 spasi) di bawah tiap `if`.
$md$),
('perulangan', 1, 'for dan range()', $md$
`for` mengulang untuk setiap nilai dalam urutan.

```python
for i in range(1, 6):   # 1, 2, 3, 4, 5
    print(i)
```

`range(a, b)` berhenti **sebelum** `b`.
$md$),
('perulangan', 2, 'while', $md$
`while` mengulang selama kondisi masih benar.

```python
total = 0
n = 5
while n > 0:
    total += n
    n -= 1
print(total)   # 15
```

Pastikan kondisinya suatu saat menjadi salah, kalau tidak program berputar selamanya.
$md$),
('list-dan-fungsi', 1, 'List', $md$
List menyimpan banyak nilai berurutan.

```python
angka = [3, 1, 2]
angka.append(9)
print(max(angka), sorted(angka), len(angka))
```

Mengubah satu baris angka menjadi list: `list(map(int, input().split()))`.
$md$),
('list-dan-fungsi', 2, 'Fungsi', $md$
Fungsi membungkus langkah yang bisa dipakai berulang.

```python
def kuadrat(x):
    return x * x

print(kuadrat(4))   # 16
```
$md$),
('studi-kasus-teks', 1, 'String dan split()', $md$
`split()` memecah kalimat menjadi list kata. `lower()` mengubah ke huruf kecil.

```python
kata = "Saya suka Python".lower().split()
print(kata)   # ['saya', 'suka', 'python']
```
$md$),
('studi-kasus-teks', 2, 'set untuk nilai unik', $md$
`set` hanya menyimpan nilai yang berbeda.

```python
print(len(set(["a", "b", "a"])))   # 2
```

`max(daftar, key=len)` mengambil elemen terpanjang; jika sama panjang, yang pertama.
$md$)
) AS v(slug, pos, title, content)
JOIN stages s ON s.slug = v.slug
ON CONFLICT (stage_id, position) DO NOTHING;

-- ---------- Studi kasus baru (latihan lama: salam, jumlah-dua-angka, genap-ganjil, fizzbuzz) ----------
INSERT INTO exercises (slug, title, description, difficulty, order_index, starter_code) VALUES
('luas-persegi-panjang', 'Luas Persegi Panjang',
 'Baca panjang lalu lebar (masing-masing satu baris, bilangan bulat). Cetak luasnya.',
 'beginner', 2, E'p = int(input())\nl = int(input())\n'),
('nilai-huruf', 'Nilai Huruf',
 'Baca nilai (bilangan bulat). Cetak A jika >= 85, B jika >= 70, C jika >= 55, selain itu D.',
 'beginner', 2, E'nilai = int(input())\n'),
('deret-jumlah', 'Jumlah Deret',
 'Baca n. Cetak hasil penjumlahan 1 + 2 + ... + n.',
 'beginner', 2, E'n = int(input())\n'),
('angka-terbesar', 'Angka Terbesar',
 'Baca satu baris bilangan bulat yang dipisah spasi. Cetak yang terbesar.',
 'intermediate', 1, E'angka = list(map(int, input().split()))\n'),
('urut-naik', 'Urutkan Naik',
 'Baca satu baris bilangan bulat yang dipisah spasi. Cetak terurut dari kecil ke besar, dipisah spasi.',
 'intermediate', 2, E'angka = list(map(int, input().split()))\n'),
('kata-terpanjang', 'Kata Terpanjang',
 'Baca satu kalimat huruf kecil. Cetak kata terpanjang; jika ada yang sama panjang, cetak yang pertama.',
 'intermediate', 1, E'kata = input().split()\n'),
('kata-unik', 'Jumlah Kata Unik',
 'Baca satu kalimat. Cetak banyaknya kata berbeda (huruf besar/kecil dianggap sama).',
 'intermediate', 2, E'kata = input().lower().split()\n')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (exercise_id, input, expected_output, is_hidden, position)
SELECT e.id, t.input, t.expected, t.hidden, t.pos
FROM (VALUES
  ('luas-persegi-panjang', E'4\n5', '20', false, 1),
  ('luas-persegi-panjang', E'7\n3', '21', false, 2),
  ('luas-persegi-panjang', E'0\n9', '0',  true,  3),

  ('nilai-huruf', '90', 'A', false, 1),
  ('nilai-huruf', '72', 'B', false, 2),
  ('nilai-huruf', '55', 'C', true,  3),
  ('nilai-huruf', '54', 'D', true,  4),
  ('nilai-huruf', '85', 'A', true,  5),

  ('deret-jumlah', '5',   '15',   false, 1),
  ('deret-jumlah', '10',  '55',   false, 2),
  ('deret-jumlah', '1',   '1',    true,  3),
  ('deret-jumlah', '100', '5050', true,  4),

  ('angka-terbesar', '3 9 2',    '9',  false, 1),
  ('angka-terbesar', '-5 -2 -9', '-2', false, 2),
  ('angka-terbesar', '7',        '7',  true,  3),

  ('urut-naik', '3 1 2',    '1 2 3',    false, 1),
  ('urut-naik', '5 5 1',    '1 5 5',    true,  2),
  ('urut-naik', '10 -1 0',  '-1 0 10',  true,  3),

  ('kata-terpanjang', 'saya suka belajar python', 'belajar', false, 1),
  ('kata-terpanjang', 'aku kamu',                 'kamu',    true,  2),
  ('kata-terpanjang', 'abc def',                  'abc',     true,  3),

  ('kata-unik', 'aku suka aku', '2', false, 1),
  ('kata-unik', 'A a B',        '2', false, 2),
  ('kata-unik', 'satu dua tiga','3', true,  3)
) AS t(slug, input, expected, hidden, pos)
JOIN exercises e ON e.slug = t.slug
ON CONFLICT (exercise_id, position) DO NOTHING;

-- ---------- Pasang latihan ke stage + XP (naik per level) ----------
UPDATE exercises e
SET stage_id = s.id, order_index = v.ord, xp = v.xp
FROM (VALUES
  ('salam',                'halo-python',      1, 10),
  ('jumlah-dua-angka',     'operasi-dasar',    1, 10),
  ('luas-persegi-panjang', 'operasi-dasar',    2, 10),
  ('genap-ganjil',         'percabangan',      1, 20),
  ('nilai-huruf',          'percabangan',      2, 20),
  ('fizzbuzz',             'perulangan',       1, 20),
  ('deret-jumlah',         'perulangan',       2, 20),
  ('angka-terbesar',       'list-dan-fungsi',  1, 30),
  ('urut-naik',            'list-dan-fungsi',  2, 30),
  ('kata-terpanjang',      'studi-kasus-teks', 1, 40),
  ('kata-unik',            'studi-kasus-teks', 2, 40)
) AS v(slug, stage_slug, ord, xp)
JOIN stages s ON s.slug = v.stage_slug
WHERE e.slug = v.slug;
