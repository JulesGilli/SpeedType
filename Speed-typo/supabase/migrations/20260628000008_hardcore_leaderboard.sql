-- ============================================================================
-- Classement HARDCORE : un seul classement all-time qui cumule les modes
-- hardcore (chaos + sudden) = somme du meilleur score par mode hardcore.
-- + Exclusion des modes hardcore du classement GLOBAL / des rangs normaux,
--   pour qu'une partie hardcore ne gonfle pas le score global (et le déblocage).
-- ============================================================================

-- Classement hardcore (top 100), tous temps confondus.
create or replace function public.st_hardcore_leaderboard()
returns table (
  user_id      uuid,
  username     text,
  total_score  integer,
  modes_played integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with best as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where s.mode in ('chaos', 'sudden')
    group by s.user_id, s.mode
  )
  select
    p.id              as user_id,
    p.username,
    sum(b.best)::int  as total_score,
    count(*)::int     as modes_played
  from best b
  join public.st_profiles p on p.id = b.user_id
  group by p.id, p.username
  order by total_score desc
  limit 100;
$$;

-- Rang hardcore du joueur connecté (pour épingler sa ligne hors top).
create or replace function public.st_my_hardcore()
returns table (
  user_id      uuid,
  username     text,
  total_score  integer,
  modes_played integer,
  rank         integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with best as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where s.mode in ('chaos', 'sudden')
    group by s.user_id, s.mode
  ),
  agg as (
    select p.id as user_id, p.username, sum(b.best)::int as total_score, count(*)::int as modes_played
    from best b
    join public.st_profiles p on p.id = b.user_id
    group by p.id, p.username
  ),
  ranked as (
    select *, rank() over (order by total_score desc)::int as rank from agg
  )
  select user_id, username, total_score, modes_played, rank
  from ranked
  where user_id = auth.uid();
$$;

-- Le classement GLOBAL exclut désormais les modes hardcore.
create or replace function public.st_global_leaderboard(
  p_period text default 'all'
)
returns table (
  user_id      uuid,
  username     text,
  total_score  integer,
  modes_played integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with best_per_mode as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where s.mode not in ('chaos', 'sudden')
      and (
        (p_period = 'week'  and s.created_at >= now() - interval '7 days')
        or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
        or (p_period = 'all')
      )
    group by s.user_id, s.mode
  )
  select
    p.id                 as user_id,
    p.username,
    sum(b.best)::int     as total_score,
    count(*)::int        as modes_played
  from best_per_mode b
  join public.st_profiles p on p.id = b.user_id
  group by p.id, p.username
  order by total_score desc
  limit 100;
$$;

create or replace function public.st_my_global(
  p_period text default 'all'
)
returns table (
  user_id      uuid,
  username     text,
  total_score  integer,
  modes_played integer,
  rank         integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with best_per_mode as (
    select s.user_id, s.mode, max(s.score) as best
    from public.st_scores s
    where s.mode not in ('chaos', 'sudden')
      and (
        (p_period = 'week'  and s.created_at >= now() - interval '7 days')
        or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
        or (p_period = 'all')
      )
    group by s.user_id, s.mode
  ),
  agg as (
    select
      p.id              as user_id,
      p.username,
      sum(b.best)::int  as total_score,
      count(*)::int     as modes_played
    from best_per_mode b
    join public.st_profiles p on p.id = b.user_id
    group by p.id, p.username
  ),
  ranked as (
    select *, rank() over (order by total_score desc)::int as rank
    from agg
  )
  select user_id, username, total_score, modes_played, rank
  from ranked
  where user_id = auth.uid();
$$;
