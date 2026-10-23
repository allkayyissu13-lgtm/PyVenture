-- Contoh latihan. Tambah sendiri sesuai kurikulum; aman dijalankan ulang.

INSERT INTO exercises (slug, title, description, difficulty, order_index, starter_code) VALUES
('salam', 'Menyapa Pengguna',
 'Baca satu baris nama dengan input(), lalu cetak: Halo, <nama>!',
 'beginner', 1, E'nama = input()\n# tulis kodemu di bawah\n'),
('jumlah-dua-angka', 'Jumlah Dua Angka',
 'Baca dua bilangan bulat (masing-masing di satu baris), lalu cetak hasil penjumlahannya.',
 'beginner', 2, E'a = int(input())\nb = int(input())\n'),
('genap-ganjil', 'Genap atau Ganjil',
 'Baca satu bilangan bulat n. Cetak "genap" jika n genap, selain itu cetak "ganjil".',
 'beginner', 3, E'n = int(input())\n'),
('fizzbuzz', 'FizzBuzz',
 'Baca n. Untuk setiap angka 1..n cetak satu baris: "FizzBuzz" jika habis dibagi 3 dan 5, "Fizz" jika habis dibagi 3, "Buzz" jika habis dibagi 5, selain itu angkanya.',
 'intermediate', 1, E'n = int(input())\n')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (exercise_id, input, expected_output, is_hidden, position)
SELECT e.id, t.input, t.expected, t.hidden, t.pos
FROM (VALUES
  ('salam', 'Budi',  'Halo, Budi!',  false, 1),
  ('salam', 'Ani',   'Halo, Ani!',   false, 2),
  ('salam', 'Dimas', 'Halo, Dimas!', true,  3),

  ('jumlah-dua-angka', E'2\n3',   '5',  false, 1),
  ('jumlah-dua-angka', E'10\n-4', '6',  false, 2),
  ('jumlah-dua-angka', E'0\n0',   '0',  true,  3),
  ('jumlah-dua-angka', E'123\n877', '1000', true, 4),

  ('genap-ganjil', '4', 'genap',  false, 1),
  ('genap-ganjil', '7', 'ganjil', false, 2),
  ('genap-ganjil', '0', 'genap',  true,  3),
  ('genap-ganjil', '-3', 'ganjil', true, 4),

  ('fizzbuzz', '5',  E'1\n2\nFizz\n4\nBuzz', false, 1),
  ('fizzbuzz', '15', E'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', true, 2),
  ('fizzbuzz', '1',  '1', true, 3)
) AS t(slug, input, expected, hidden, pos)
JOIN exercises e ON e.slug = t.slug
ON CONFLICT (exercise_id, position) DO NOTHING;
