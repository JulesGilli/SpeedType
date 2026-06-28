-- ============================================================================
-- Classement GLOBAL : regroupe tous les modes de jeu.
-- Score global = somme, pour chaque joueur, de son meilleur score par mode.
-- Sert de base aux rangs (Bronze -> Maître) calculés côté client.
-- ============================================================================

-- Top joueurs par score global, sur une période (week | month | all).
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
    where (
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

-- Rang global du joueur connecté (même hors top 10) pour épingler sa ligne.
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
    where (
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
