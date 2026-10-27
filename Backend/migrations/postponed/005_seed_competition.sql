-- Contoh kontes. Ubah starts_at / ends_at sesuai kebutuhan. Aman dijalankan ulang.

INSERT INTO exercises (slug, title, description, difficulty, order_index, starter_code, is_public) VALUES
('kontes1-kuadrat', 'Kuadrat',
 'Baca satu bilangan bulat n, lalu cetak n pangkat dua.',
 'beginner', 0, E'n = int(input())\n', false),
('kontes1-vokal', 'Hitung Vokal',
 'Baca satu baris teks huruf kecil. Cetak banyaknya huruf vokal (a, i, u, e, o).',
 'beginner', 0, E'teks = input()\n', false),
('kontes1-palindrom', 'Palindrom',
 'Baca satu kata. Cetak "ya" jika kata itu palindrom, selain itu cetak "tidak".',
 'intermediate', 0, E'kata = input()\n', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (exercise_id, input, expected_output, is_hidden, position)
SELECT e.id, t.input, t.expected, t.hidden, t.pos
FROM (VALUES
  ('kontes1-kuadrat', '4',  '16',  false, 1),
  ('kontes1-kuadrat', '-3', '9',   true,  2),
  ('kontes1-kuadrat', '0',  '0',   true,  3),

  ('kontes1-vokal', 'halo dunia', '5', false, 1),
  ('kontes1-vokal', 'rhythm',     '0', true,  2),
  ('kontes1-vokal', 'aiueo',      '5', true,  3),

  ('kontes1-palindrom', 'katak', 'ya',    false, 1),
  ('kontes1-palindrom', 'kayak', 'ya',    true,  2),
  ('kontes1-palindrom', 'python','tidak', true,  3)
) AS t(slug, input, expected, hidden, pos)
JOIN exercises e ON e.slug = t.slug
ON CONFLICT (exercise_id, position) DO NOTHING;

INSERT INTO competitions (slug, title, description, starts_at, ends_at, penalty_minutes)
VALUES ('kontes-percobaan', 'Kontes Percobaan',
        'Kontes contoh: 3 soal, skor tertinggi menang, seri diputus oleh waktu + penalti.',
        now(), now() + interval '7 days', 10)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO competition_problems (competition_id, exercise_id, label, points)
SELECT c.id, e.id, v.label, v.points
FROM (VALUES ('A', 'kontes1-kuadrat', 100), ('B', 'kontes1-vokal', 150), ('C', 'kontes1-palindrom', 200))
     AS v(label, slug, points)
JOIN exercises e ON e.slug = v.slug
CROSS JOIN competitions c WHERE c.slug = 'kontes-percobaan'
ON CONFLICT DO NOTHING;
