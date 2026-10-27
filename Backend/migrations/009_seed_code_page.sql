-- Isi contoh untuk kotak Format Masukan/Keluaran (11 latihan) + hint (4 latihan).

UPDATE exercises e SET input_format = v.inp, output_format = v.outp
FROM (VALUES
  ('salam',                'Satu baris berisi nama (teks).',                          'Satu baris: Halo, <nama>!'),
  ('jumlah-dua-angka',     'Dua baris, masing-masing satu bilangan bulat.',           'Satu bilangan bulat: hasil penjumlahan.'),
  ('luas-persegi-panjang', 'Dua baris: panjang lalu lebar (bilangan bulat).',         'Satu bilangan bulat: luasnya.'),
  ('genap-ganjil',         'Satu baris berisi bilangan bulat n.',                     'Satu kata: genap atau ganjil.'),
  ('nilai-huruf',          'Satu baris berisi nilai (bilangan bulat).',               'Satu huruf: A, B, C, atau D.'),
  ('fizzbuzz',             'Satu baris berisi bilangan bulat n.',                     'n baris: angka, Fizz, Buzz, atau FizzBuzz.'),
  ('deret-jumlah',         'Satu baris berisi bilangan bulat n.',                     'Satu bilangan bulat: 1 + 2 + ... + n.'),
  ('angka-terbesar',       'Satu baris bilangan bulat yang dipisah spasi.',           'Satu bilangan bulat: yang terbesar.'),
  ('urut-naik',            'Satu baris bilangan bulat yang dipisah spasi.',           'Satu baris: bilangan terurut naik, dipisah spasi.'),
  ('kata-terpanjang',      'Satu baris kalimat huruf kecil.',                         'Satu kata terpanjang (yang pertama jika seri).'),
  ('kata-unik',            'Satu baris kalimat.',                                     'Satu bilangan bulat: jumlah kata berbeda.')
) AS v(slug, inp, outp)
WHERE e.slug = v.slug;

INSERT INTO exercise_hints (exercise_id, position, content)
SELECT e.id, v.pos, v.content
FROM (VALUES
  ('deret-jumlah', 1, 'Kamu perlu menjumlahkan banyak angka. Pikirkan perulangan.'),
  ('deret-jumlah', 2, 'Siapkan total = 0, lalu tambahkan i pada tiap putaran for i in range(1, n + 1).'),
  ('deret-jumlah', 3, 'Cara ringkas: sum(range(1, n + 1)).'),

  ('nilai-huruf', 1, 'Periksa syarat dari yang tertinggi ke yang terendah.'),
  ('nilai-huruf', 2, 'Pakai if / elif / else; urutan elif menentukan hasil.'),
  ('nilai-huruf', 3, 'Syarat pertama: nilai >= 85 menghasilkan A.'),

  ('fizzbuzz', 1, 'Periksa kelipatan 3 dan 5 sekaligus lebih dulu.'),
  ('fizzbuzz', 2, 'Habis dibagi 3 dan 5 sekaligus berarti habis dibagi 15.'),
  ('fizzbuzz', 3, 'Operator % memberi sisa bagi; i % 15 == 0 berarti kelipatan 15.'),

  ('kata-terpanjang', 1, 'Pecah kalimat menjadi list kata dengan split().'),
  ('kata-terpanjang', 2, 'Fungsi max() punya parameter key.'),
  ('kata-terpanjang', 3, 'max(kata, key=len) mengambil kata pertama jika ada yang sama panjang.')
) AS v(slug, pos, content)
JOIN exercises e ON e.slug = v.slug
ON CONFLICT (exercise_id, position) DO NOTHING;
