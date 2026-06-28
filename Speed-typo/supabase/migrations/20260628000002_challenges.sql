-- ============================================================================
-- Système de défis mensuels
-- - pool de quêtes (st_challenge_templates)
-- - génération déterministe de 10 défis/mois (st_ensure_month_challenges)
-- - validation anti-triche dérivée des vrais scores (st_claim_challenges)
-- - lecture des défis du mois avec statut (st_my_challenges)
-- Points = base (difficulté) × bonus "tôt dans le mois".
-- ============================================================================

-- Combo max d'une partie (nécessaire pour valider les défis de combo).
alter table public.st_scores
  add column if not exists max_combo integer not null default 0 check (max_combo >= 0);

-- Libellé de difficulté affiché côté UI.
alter table public.st_challenges
  add column if not exists difficulty text;

-- ----------------------------------------------------------------------------
-- Pool de quêtes
-- ----------------------------------------------------------------------------
create table if not exists public.st_challenge_templates (
  id          bigint generated always as identity primary key,
  goal_type   text not null,   -- score | wpm | words | combo | accuracy | games
  goal_value  integer not null,
  mode        text,            -- mode imposé (null = tous modes)
  difficulty  text not null,   -- facile | moyen | difficile | extreme
  base_points integer not null,
  title       text not null,
  description text not null
);

alter table public.st_challenge_templates enable row level security;
-- Pas de policy : table interne, seules les fonctions SECURITY DEFINER y accèdent.

-- Seed du pool (idempotent : on ne réinsère pas si déjà présent).
insert into public.st_challenge_templates (goal_type, goal_value, mode, difficulty, base_points, title, description)
select * from (values
  ('games',    1,  null,        'facile',    50,  'Échauffement',        'Termine une partie'),
  ('wpm',      25, null,        'facile',    50,  'Petit doigté',        'Atteins 25 WPM dans une partie'),
  ('words',    15, null,        'facile',    50,  'Bavard',              'Tape 15 mots dans une partie'),
  ('score',    800,'classique', 'facile',    50,  'Premiers pas',        'Marque 800 points en Classique'),
  ('wpm',      40, null,        'moyen',     120, 'Doigts agiles',       'Atteins 40 WPM dans une partie'),
  ('score',    2000,'classique','moyen',     120, 'Bon score',           'Marque 2000 points en Classique'),
  ('combo',    5,  null,        'moyen',     120, 'Combo x5',            'Enchaîne un combo de 5'),
  ('words',    30, null,        'moyen',     120, 'Machine à écrire',    'Tape 30 mots dans une partie'),
  ('score',    1500,'leet',     'moyen',     120, 'Leet initié',         'Marque 1500 points en Leet'),
  ('wpm',      60, null,        'difficile', 250, 'Vitesse éclair',      'Atteins 60 WPM dans une partie'),
  ('score',    4000,'classique','difficile', 250, 'Gros score',          'Marque 4000 points en Classique'),
  ('combo',    10, null,        'difficile', 250, 'Combo x10',           'Enchaîne un combo de 10'),
  ('score',    2500,'inversé',  'difficile', 250, 'Cerveau inversé',     'Marque 2500 points en Inversé'),
  ('accuracy', 95, null,        'difficile', 250, 'Précision',           'Termine une partie de 20+ mots à 95% de précision'),
  ('wpm',      80, null,        'extreme',   500, 'Surhumain',           'Atteins 80 WPM dans une partie'),
  ('accuracy', 100,null,        'extreme',   500, 'Sans-faute',          'Termine une partie de 20+ mots à 100% de précision'),
  ('score',    6000,'classique','extreme',   500, 'Légende',             'Marque 6000 points en Classique'),
  ('combo',    15, null,        'extreme',   500, 'Combo démentiel',     'Enchaîne un combo de 15'),
  ('score',    3000,'memoire',  'extreme',   500, 'Mémoire d''éléphant', 'Marque 3000 points en Mémoire')
) as v(goal_type, goal_value, mode, difficulty, base_points, title, description)
where not exists (select 1 from public.st_challenge_templates);

-- ----------------------------------------------------------------------------
-- Génère (une fois) les 10 défis du mois courant, tirés du pool de façon
-- déterministe (même tirage pour tous les joueurs).
-- ----------------------------------------------------------------------------
create or replace function public.st_ensure_month_challenges()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', now())::date;
begin
  perform pg_advisory_xact_lock(hashtext('st_ch_' || v_month::text));

  if exists (select 1 from public.st_challenges where month = v_month) then
    return;
  end if;

  insert into public.st_challenges (month, title, description, mode, goal_type, goal_value, points, difficulty)
  select v_month, t.title, t.description, t.mode, t.goal_type, t.goal_value, t.base_points, t.difficulty
  from public.st_challenge_templates t
  order by md5(v_month::text || t.id::text)
  limit 10;
end;
$$;

-- ----------------------------------------------------------------------------
-- Valide les défis du mois pour l'utilisateur courant, à partir de ses VRAIS
-- scores (st_scores). Calcule les points (base × bonus précocité) côté serveur.
-- Renvoie les défis nouvellement validés (pour notifier le joueur).
-- ----------------------------------------------------------------------------
create or replace function public.st_claim_challenges()
returns table (challenge_id bigint, title text, points_earned integer)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_days_in_month int := extract(day from (date_trunc('month', now()) + interval '1 month - 1 day'))::int;
  c record;
  v_achieved timestamptz;
  v_day int;
  v_mult numeric;
  v_points int;
begin
  if v_uid is null then
    return;
  end if;

  perform public.st_ensure_month_challenges();

  for c in
    select ch.* from public.st_challenges ch
    where ch.month = date_trunc('month', now())::date
      and not exists (
        select 1 from public.st_challenge_completions cc
        where cc.user_id = v_uid and cc.challenge_id = ch.id
      )
  loop
    v_achieved := null;

    if c.goal_type = 'games' then
      select s.created_at into v_achieved
      from public.st_scores s
      where s.user_id = v_uid
        and date_trunc('month', s.created_at) = date_trunc('month', now())
        and (c.mode is null or s.mode = c.mode)
      order by s.created_at asc
      offset greatest(c.goal_value - 1, 0) limit 1;
    else
      select min(s.created_at) into v_achieved
      from public.st_scores s
      where s.user_id = v_uid
        and date_trunc('month', s.created_at) = date_trunc('month', now())
        and (c.mode is null or s.mode = c.mode)
        and (
          (c.goal_type = 'score'    and s.score >= c.goal_value) or
          (c.goal_type = 'wpm'      and s.wpm >= c.goal_value) or
          (c.goal_type = 'words'    and s.word_count >= c.goal_value) or
          (c.goal_type = 'combo'    and s.max_combo >= c.goal_value) or
          (c.goal_type = 'accuracy' and s.accuracy >= c.goal_value and s.word_count >= 20)
        );
    end if;

    if v_achieved is not null then
      v_day := extract(day from v_achieved)::int;
      v_mult := 1 + 0.5 * (v_days_in_month - v_day)::numeric / v_days_in_month;
      v_points := round(c.points * v_mult)::int;

      insert into public.st_challenge_completions (user_id, challenge_id, points_earned, created_at)
      values (v_uid, c.id, v_points, v_achieved)
      on conflict (user_id, challenge_id) do nothing;

      challenge_id := c.id;
      title := c.title;
      points_earned := v_points;
      return next;
    end if;
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- Défis du mois courant + statut de complétion pour l'utilisateur courant.
-- ----------------------------------------------------------------------------
create or replace function public.st_my_challenges()
returns table (
  id            bigint,
  title         text,
  description   text,
  difficulty    text,
  mode          text,
  goal_type     text,
  goal_value    integer,
  base_points   integer,
  completed     boolean,
  points_earned integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    ch.id, ch.title, ch.description, ch.difficulty, ch.mode,
    ch.goal_type, ch.goal_value, ch.points as base_points,
    (cc.id is not null) as completed,
    coalesce(cc.points_earned, 0) as points_earned
  from public.st_challenges ch
  left join public.st_challenge_completions cc
    on cc.challenge_id = ch.id and cc.user_id = auth.uid()
  where ch.month = date_trunc('month', now())::date
  order by ch.points asc, ch.id asc;
$$;

-- ----------------------------------------------------------------------------
-- Sécurité : la complétion ne passe QUE par st_claim_challenges (anti-triche).
-- ----------------------------------------------------------------------------
drop policy if exists "st_challenge_completions insert self" on public.st_challenge_completions;

revoke execute on function public.st_ensure_month_challenges() from public, anon;
revoke execute on function public.st_claim_challenges() from public, anon;
grant execute on function public.st_ensure_month_challenges() to authenticated;
grant execute on function public.st_claim_challenges() to authenticated;

grant select on public.st_challenge_leaderboard_monthly to anon, authenticated;
