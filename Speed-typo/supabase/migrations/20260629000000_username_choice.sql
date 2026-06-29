-- ============================================================================
-- Choix du pseudo à la première connexion (notamment Google OAuth).
-- ----------------------------------------------------------------------------
-- Avant : à la 1re connexion Google, le trigger créait un pseudo automatique
-- (partie avant le @ de l'email). L'utilisateur ne le choisissait jamais.
-- Après : on garde un pseudo provisoire mais on marque `username_set = false`
-- tant qu'il n'a pas été choisi explicitement → le client affiche une modale.
-- Idempotente : ré-exécutable sans erreur.
-- ============================================================================

-- Drapeau : true = pseudo choisi explicitement par l'utilisateur.
alter table public.st_profiles
  add column if not exists username_set boolean not null default false;

-- Comptes existants : ils ont déjà un pseudo, on ne veut pas leur réafficher la
-- modale → on considère leur pseudo comme déjà choisi.
update public.st_profiles set username_set = true where username_set = false;

-- À l'inscription :
-- - inscription email (username dans les métadonnées) → username_set = true.
-- - connexion Google (pas de username) → pseudo provisoire + username_set = false.
-- On garantit aussi l'unicité du pseudo provisoire (colonne username unique) en
-- ajoutant un suffixe numérique si besoin (évite que le trigger échoue).
create or replace function public.st_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta_username  text := nullif(trim(new.raw_user_meta_data->>'username'), '');
  base_username  text := coalesce(meta_username, split_part(new.email, '@', 1));
  final_username text := base_username;
  suffix         int  := 0;
begin
  while exists (select 1 from public.st_profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.st_profiles (id, username, username_set)
  values (new.id, final_username, meta_username is not null)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger interne : non appelable via l'API REST.
revoke execute on function public.st_handle_new_user() from public, anon, authenticated;
