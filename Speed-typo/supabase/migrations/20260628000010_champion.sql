-- ============================================================================
-- Message du champion : le #1 du classement général ALL-TIME peut écrire un
-- message visible par tous en haut de page. Si quelqu'un le dépasse, le nouveau
-- #1 peut le remplacer.
-- ============================================================================

create table if not exists public.st_champion (
  id          int primary key default 1 check (id = 1),
  message     text not null default '',
  author_id   uuid references public.st_profiles (id) on delete set null,
  author_name text,
  updated_at  timestamptz not null default now()
);

alter table public.st_champion enable row level security;

-- Lecture publique du message.
drop policy if exists "st_champion read" on public.st_champion;
create policy "st_champion read" on public.st_champion for select using (true);

-- Ligne unique.
insert into public.st_champion (id, message) values (1, '') on conflict (id) do nothing;

-- Écriture réservée au #1 du classement général all-time (vérif côté serveur).
create or replace function public.st_set_champion_message(p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_top uuid;
  v_name text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select t.user_id into v_top
  from (
    select b.user_id, sum(b.best) as total
    from (
      select user_id, mode, max(score) as best
      from public.st_scores
      group by user_id, mode
    ) b
    group by b.user_id
    order by total desc
    limit 1
  ) t;

  if v_top is null or v_top <> v_uid then
    raise exception 'not_champion';
  end if;

  select username into v_name from public.st_profiles where id = v_uid;

  update public.st_champion
    set message = left(coalesce(p_message, ''), 200),
        author_id = v_uid,
        author_name = v_name,
        updated_at = now()
    where id = 1;
end;
$$;

revoke execute on function public.st_set_champion_message(text) from public, anon;
grant execute on function public.st_set_champion_message(text) to authenticated;
