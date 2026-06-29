-- ============================================================================
-- Rééquilibrage : défis Facile/Moyen/Difficile plus exigeants + 2 extrêmes.
-- (Les titres i18n sont désormais keyés sur le titre FR stable, les descriptions
--  se régénèrent depuis goal_value : aucun changement i18n nécessaire ici.)
-- N'affecte que la génération des mois suivants.
-- ============================================================================

-- WPM
update public.st_challenge_templates set goal_value = 45 where title = 'Petit doigté';
update public.st_challenge_templates set goal_value = 55 where title = 'Doigts agiles';
update public.st_challenge_templates set goal_value = 70 where title = 'Vitesse éclair';

-- Mots
update public.st_challenge_templates set goal_value = 35 where title = 'Bavard';
update public.st_challenge_templates set goal_value = 45 where title = 'Machine à écrire';

-- Score
update public.st_challenge_templates set goal_value = 1500 where title = 'Premiers pas';
update public.st_challenge_templates set goal_value = 3000 where title = 'Bon score';
update public.st_challenge_templates set goal_value = 5500 where title = 'Gros score';
update public.st_challenge_templates set goal_value = 2500 where title = 'Leet initié';
update public.st_challenge_templates set goal_value = 3500 where title = 'Cerveau inversé';
update public.st_challenge_templates set goal_value = 5000 where title = 'Mémoire d''éléphant';

-- Parties
update public.st_challenge_templates set goal_value = 5 where title = 'Échauffement';

-- Validation : les défis de précision exigent désormais 40 mots (100%) / 30 mots (sinon).
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
          (c.goal_type = 'accuracy' and s.accuracy >= c.goal_value
             and s.word_count >= (case when c.goal_value >= 100 then 40 else 30 end))
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
