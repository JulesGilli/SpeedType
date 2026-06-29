-- ============================================================================
-- Refonte des classements :
-- - le classement GLOBAL réintègre TOUS les modes (hardcore compris) : une
--   partie hardcore s'ajoute donc au score général.
-- - le classement HARDCORE = le classement général, filtré aux joueurs qui ont
--   débloqué le hardcore (score global >= seuil passé par le client, p_min).
-- ============================================================================

-- Global : on retire l'exclusion des modes hardcore.
create or replace function public.st_global_leaderboard(p_period text default 'all')
returns table (user_id uuid, username text, total_score integer, modes_played integer)
language sql stable security invoker set search_path = public
as $$
  with best_per_mode as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where (
      (p_period = 'week'  and s.created_at >= now() - interval '7 days')
      or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
      or (p_period = 'all')
    )
    group by s.user_id, s.mode
  )
  select p.id as user_id, p.username, sum(b.best)::int as total_score, count(*)::int as modes_played
  from best_per_mode b join public.st_profiles p on p.id = b.user_id
  group by p.id, p.username
  order by total_score desc
  limit 100;
$$;

create or replace function public.st_my_global(p_period text default 'all')
returns table (user_id uuid, username text, total_score integer, modes_played integer, rank integer)
language sql stable security invoker set search_path = public
as $$
  with best_per_mode as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where (
      (p_period = 'week'  and s.created_at >= now() - interval '7 days')
      or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
      or (p_period = 'all')
    )
    group by s.user_id, s.mode
  ),
  agg as (
    select p.id as user_id, p.username, sum(b.best)::int as total_score, count(*)::int as modes_played
    from best_per_mode b join public.st_profiles p on p.id = b.user_id
    group by p.id, p.username
  ),
  ranked as (
    select *, rank() over (order by total_score desc)::int as rank from agg
  )
  select user_id, username, total_score, modes_played, rank from ranked where user_id = auth.uid();
$$;

-- Anciennes versions sans argument du classement hardcore -> on les remplace.
drop function if exists public.st_hardcore_leaderboard();
drop function if exists public.st_my_hardcore();

-- Hardcore = global (tous modes) restreint aux joueurs débloqués (total >= p_min).
create or replace function public.st_hardcore_leaderboard(p_min integer, p_period text default 'month')
returns table (user_id uuid, username text, total_score integer, modes_played integer)
language sql stable security invoker set search_path = public
as $$
  with best_per_mode as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where (
      (p_period = 'week'  and s.created_at >= now() - interval '7 days')
      or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
      or (p_period = 'all')
    )
    group by s.user_id, s.mode
  ),
  agg as (
    select p.id as user_id, p.username, sum(b.best)::int as total_score, count(*)::int as modes_played
    from best_per_mode b join public.st_profiles p on p.id = b.user_id
    group by p.id, p.username
  )
  select * from agg where total_score >= p_min order by total_score desc limit 100;
$$;

create or replace function public.st_my_hardcore(p_min integer, p_period text default 'month')
returns table (user_id uuid, username text, total_score integer, modes_played integer, rank integer)
language sql stable security invoker set search_path = public
as $$
  with best_per_mode as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where (
      (p_period = 'week'  and s.created_at >= now() - interval '7 days')
      or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
      or (p_period = 'all')
    )
    group by s.user_id, s.mode
  ),
  agg as (
    select p.id as user_id, p.username, sum(b.best)::int as total_score, count(*)::int as modes_played
    from best_per_mode b join public.st_profiles p on p.id = b.user_id
    group by p.id, p.username
  ),
  ranked as (
    select *, rank() over (order by total_score desc)::int as rank
    from agg where total_score >= p_min
  )
  select user_id, username, total_score, modes_played, rank from ranked where user_id = auth.uid();
$$;
