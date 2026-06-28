-- ============================================================================
-- Rang du joueur connecté pour une période + un mode donnés.
-- Permet d'épingler la ligne du joueur sous le top 10 quand il n'y figure pas.
-- Renvoie 0 ou 1 ligne (aucune si le joueur n'a pas de score sur ce filtre).
-- ============================================================================

-- security invoker : auth.uid() = l'utilisateur appelant ; la RLS de st_scores
-- (lecture publique) s'applique normalement pour le calcul du rang global.
create or replace function public.st_my_rank(
  p_period text default 'week',
  p_mode   text default 'classique'
)
returns table (
  user_id     uuid,
  username    text,
  best_score  integer,
  best_wpm    integer,
  games_count integer,
  rank        integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with agg as (
    select
      p.id                  as user_id,
      p.username,
      max(s.score)::int     as best_score,
      max(s.wpm)::int       as best_wpm,
      count(*)::int         as games_count
    from public.st_scores s
    join public.st_profiles p on p.id = s.user_id
    where s.mode = p_mode
      and (
        (p_period = 'week'  and s.created_at >= now() - interval '7 days')
        or (p_period = 'month' and date_trunc('month', s.created_at) = date_trunc('month', now()))
        or (p_period = 'all')
      )
    group by p.id, p.username
  ),
  ranked as (
    select *, rank() over (order by best_score desc)::int as rank
    from agg
  )
  select user_id, username, best_score, best_wpm, games_count, rank
  from ranked
  where user_id = auth.uid();
$$;
