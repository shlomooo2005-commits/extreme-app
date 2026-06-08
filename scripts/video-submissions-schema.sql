-- HobbyX public video feed (Supabase) — all users' uploaded competition videos
-- Run in Supabase SQL editor after profiles-schema.sql / feed-votes-schema.sql.

create table if not exists public.video_submissions (
  clip_id text primary key,
  submission_id text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  competition_id text not null,
  category_slug text not null,
  athlete_name text not null,
  competition_title text not null,
  video_url text not null,
  poster_url text,
  duration_seconds integer not null default 15,
  source text not null default 'external',
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create index if not exists video_submissions_category_idx
  on public.video_submissions (category_slug);

create index if not exists video_submissions_created_idx
  on public.video_submissions (created_at desc);

alter table public.video_submissions enable row level security;

create policy "Anyone can read published videos"
  on public.video_submissions
  for select
  to authenticated, anon
  using (status = 'published');

create policy "Authenticated users publish own videos"
  on public.video_submissions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own videos"
  on public.video_submissions
  for update
  to authenticated
  using (auth.uid() = user_id);
