-- ============================================================================
-- Défis "multi-modes" : récompenser les joueurs qui touchent à différents modes.
-- Nouveau goal_type 'modes' = nombre de modes de jeu distincts joués dans le mois.
-- ============================================================================

-- Nouvelles quêtes (guardées par titre pour rester idempotent).
insert into public.st_challenge_templates (goal_type, goal_value, mode, difficulty, base_points, title, description)
select * from (values
  ('modes', 2, null, 'facile', 50,  'Curieux',           'Joue à 2 modes de jeu différents'),
  ('modes', 3, null, 'moyen',  120, 'Touche-à-tout',     'Joue à 3 modes de jeu différents'),
  ('modes', 4, null, 'difficile', 250, 'Éclectique',     'Joue à 4 modes de jeu différents'),
  ('modes', 6, null, 'extreme', 500, 'Maître polyvalent', 'Joue aux 6 modes de jeu')
) as v(goal_type, goal_value, mode, difficulty, base_points, title, description)
where not exists (
  select 1 from public.st_challenge_templates t where t.goal_type = 'modes'
);

-- Mise à jour de la validation : prise en charge du goal_type 'modes'.
-- Pour 'modes', la date d'accomplissement = date où le N-ième mode distinct a été
-- joué pour la première fois (=> bonus précocité cohérent).
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

    elsif c.goal_type = 'modes' then
      select fp.first_at into v_achieved
      from (
        select s.mode, min(s.created_at) as first_at
        from public.st_scores s
        where s.user_id = v_uid
          and date_trunc('month', s.created_at) = date_trunc('month', now())
        group by s.mode
      ) fp
      order by fp.first_at asc
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
