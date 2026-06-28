-- ============================================================================
-- Leaderboards : fonction paramétrée par période + mode.
-- Remplace les vues st_leaderboard_weekly / st_leaderboard_monthly (qui
-- agrégeaient tous les modes ensemble, mélangeant points et mètres du mode endless).
-- ============================================================================

drop view if exists public.st_leaderboard_weekly;
drop view if exists public.st_leaderboard_monthly;

-- p_period : 'week' | 'month' | 'all'  •  p_mode : un mode de jeu (ex 'classique').
-- security invoker : la RLS de st_scores (lecture publique) s'applique normalement.
create or replace function public.st_leaderboard(
  p_period text default 'week',
  p_mode   text default 'classique'
)
returns table (
  user_id     uuid,
  username    text,
  best_score  integer,
  best_wpm    integer,
  games_count integer
)
language sql
stable
security invoker
set search_path = public
as $$
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
  order by best_score desc
  limit 100;
$$;
