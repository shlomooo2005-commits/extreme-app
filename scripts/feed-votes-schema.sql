-- HobbyX feed votes (Supabase) — TikTok-style dashboard voting with realtime counts
-- 1. Run this script in the Supabase SQL editor.
-- 2. In Supabase Dashboard → Database → Replication, enable Realtime for
--    public.feed_clip_vote_stats so vote counts update live across clients.

create table if not exists public.feed_clip_vote_stats (
  clip_id text primary key,
  vote_count integer not null default 0 check (vote_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_clip_votes (
  clip_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (clip_id, user_id)
);

create index if not exists feed_clip_votes_user_idx
  on public.feed_clip_votes (user_id);

alter table public.feed_clip_vote_stats enable row level security;
alter table public.feed_clip_votes enable row level security;

create policy "Anyone can read vote stats"
  on public.feed_clip_vote_stats
  for select
  to authenticated, anon
  using (true);

create policy "Users can read own votes"
  on public.feed_clip_votes
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.ensure_clip_vote_stats(p_clip_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.feed_clip_vote_stats (clip_id, vote_count)
  values (p_clip_id, 0)
  on conflict (clip_id) do nothing;
end;
$$;

create or replace function public.toggle_feed_clip_vote(p_clip_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_liked boolean;
  v_count integer;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  perform public.ensure_clip_vote_stats(p_clip_id);

  if exists (
    select 1
    from public.feed_clip_votes
    where clip_id = p_clip_id and user_id = v_user
  ) then
    delete from public.feed_clip_votes
    where clip_id = p_clip_id and user_id = v_user;

    update public.feed_clip_vote_stats
    set vote_count = greatest(vote_count - 1, 0), updated_at = now()
    where clip_id = p_clip_id;

    v_liked := false;
  else
    insert into public.feed_clip_votes (clip_id, user_id)
    values (p_clip_id, v_user);

    update public.feed_clip_vote_stats
    set vote_count = vote_count + 1, updated_at = now()
    where clip_id = p_clip_id;

    v_liked := true;
  end if;

  select vote_count into v_count
  from public.feed_clip_vote_stats
  where clip_id = p_clip_id;

  return jsonb_build_object('liked', v_liked, 'vote_count', coalesce(v_count, 0));
end;
$$;

grant execute on function public.ensure_clip_vote_stats(text) to authenticated;
grant execute on function public.toggle_feed_clip_vote(text) to authenticated;
