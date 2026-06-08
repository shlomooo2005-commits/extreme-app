-- HobbyX user profiles — sport preferences for personalized dashboard feed
-- Run in Supabase SQL editor (or link via migration tooling).

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  preferred_sport_interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_interests_idx
  on public.user_profiles using gin (preferred_sport_interests);

alter table public.user_profiles enable row level security;

create policy "Users can read own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);
