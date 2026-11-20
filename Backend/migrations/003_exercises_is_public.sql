-- Soal kontes disembunyikan dari fitur Learning (is_public = false)
-- supaya tidak bisa dibaca / dikerjakan di luar kontes.

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

create table public.exercises (
  id serial not null,
  slug text not null,
  title text not null,
  description text not null,
  difficulty text not null,
  order_index integer not null default 0,
  starter_code text not null default ''::text,
  created_at timestamp with time zone not null default now(),
  constraint exercises_pkey primary key (id),
  constraint exercises_slug_key unique (slug),
  constraint exercises_difficulty_check check (
    (
      difficulty = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;