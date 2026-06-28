-- ============================================================================
-- Speed Typo — migration initiale
-- ----------------------------------------------------------------------------
-- Appliquée via le MCP Supabase et/ou l'intégration GitHub (merge sur `main`).
-- Idempotente : ré-exécutable sans erreur (drop policy if exists + if not exists).
-- Tables préfixées `st_` pour cohabiter avec un projet Supabase existant.
-- Sécurité : Row Level Security (RLS) activé sur toutes les tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILS — un par compte (auth.users). Stocke le pseudo public.
-- ----------------------------------------------------------------------------
create table if not exists public.st_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  created_at  timestamptz not null default now()
);

alter table public.st_profiles enable row level security;

-- Tout le monde peut lire les pseudos (affichage des classements).
drop policy if exists "st_profiles read" on public.st_profiles;
create policy "st_profiles read" on public.st_profiles
  for select using (true);

-- Un user ne peut créer/modifier que son propre profil.
drop policy if exists "st_profiles insert self" on public.st_profiles;
create policy "st_profiles insert self" on public.st_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "st_profiles update self" on public.st_profiles;
create policy "st_profiles update self" on public.st_profiles
  for update using (auth.uid() = id);

-- À l'inscription, crée automatiquement un profil avec le username fourni
-- dans les métadonnées (sinon un fallback basé sur l'email).
create or replace function public.st_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.st_profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- C'est un trigger interne : il ne doit pas être appelable via l'API REST.
revoke execute on function public.st_handle_new_user() from public, anon, authenticated;

drop trigger if exists st_on_auth_user_created on auth.users;
create trigger st_on_auth_user_created
  after insert on auth.users
  for each row execute function public.st_handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. SCORES — une ligne par partie terminée. Base des leaderboards hebdo/mensuel.
-- ----------------------------------------------------------------------------
create table if not exists public.st_scores (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.st_profiles (id) on delete cascade,
  mode        text not null,
  score       integer not null check (score >= 0),
  wpm         integer not null default 0 check (wpm >= 0),
  accuracy    integer not null default 0 check (accuracy between 0 and 100),
  word_count  integer not null default 0 check (word_count >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists st_scores_created_at_idx on public.st_scores (created_at desc);
create index if not exists st_scores_user_idx on public.st_scores (user_id);

alter table public.st_scores enable row level security;

-- Classements publics : lecture pour tout le monde.
drop policy if exists "st_scores read" on public.st_scores;
create policy "st_scores read" on public.st_scores
  for select using (true);

-- Un user n'insère que ses propres scores (anti-triche basique).
drop policy if exists "st_scores insert self" on public.st_scores;
create policy "st_scores insert self" on public.st_scores
  for insert with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. DÉFIS — renouvelés chaque mois. `month` = 1er jour du mois concerné.
-- ----------------------------------------------------------------------------
create table if not exists public.st_challenges (
  id           bigint generated always as identity primary key,
  month        date not null,                 -- ex: 2026-06-01
  title        text not null,
  description  text not null,
  mode         text,                           -- mode imposé (null = libre)
  goal_type    text not null,                  -- ex: 'score', 'wpm', 'words', 'combo'
  goal_value   integer not null,               -- objectif à atteindre
  points       integer not null default 100,   -- points gagnés si réussi
  created_at   timestamptz not null default now()
);

create index if not exists st_challenges_month_idx on public.st_challenges (month desc);

alter table public.st_challenges enable row level security;

-- Lecture publique des défis ; la création se fait via le dashboard (service_role).
drop policy if exists "st_challenges read" on public.st_challenges;
create policy "st_challenges read" on public.st_challenges
  for select using (true);

-- ----------------------------------------------------------------------------
-- 4. COMPLÉTIONS DE DÉFIS — base du 2e classement mensuel (par points de défis).
-- ----------------------------------------------------------------------------
create table if not exists public.st_challenge_completions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.st_profiles (id) on delete cascade,
  challenge_id  bigint not null references public.st_challenges (id) on delete cascade,
  points_earned integer not null default 0 check (points_earned >= 0),
  created_at    timestamptz not null default now(),
  unique (user_id, challenge_id)  -- un défi compté une seule fois par joueur
);

alter table public.st_challenge_completions enable row level security;

drop policy if exists "st_challenge_completions read" on public.st_challenge_completions;
create policy "st_challenge_completions read" on public.st_challenge_completions
  for select using (true);

drop policy if exists "st_challenge_completions insert self" on public.st_challenge_completions;
create policy "st_challenge_completions insert self" on public.st_challenge_completions
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- VUES — les classements ne sont que des requêtes filtrées par période.
-- security_invoker = on : la RLS des tables sous-jacentes s'applique aussi via l'API.
-- ============================================================================

-- Leaderboard hebdomadaire : meilleur score de chaque joueur sur 7 jours glissants.
create or replace view public.st_leaderboard_weekly
  with (security_invoker = on) as
select
  p.id           as user_id,
  p.username,
  max(s.score)   as best_score,
  max(s.wpm)     as best_wpm
from public.st_scores s
join public.st_profiles p on p.id = s.user_id
where s.created_at >= now() - interval '7 days'
group by p.id, p.username
order by best_score desc;

-- Leaderboard mensuel : meilleur score de chaque joueur sur le mois calendaire courant.
create or replace view public.st_leaderboard_monthly
  with (security_invoker = on) as
select
  p.id           as user_id,
  p.username,
  max(s.score)   as best_score,
  max(s.wpm)     as best_wpm
from public.st_scores s
join public.st_profiles p on p.id = s.user_id
where date_trunc('month', s.created_at) = date_trunc('month', now())
group by p.id, p.username
order by best_score desc;

-- Classement défis mensuel : somme des points de défis gagnés ce mois-ci.
create or replace view public.st_challenge_leaderboard_monthly
  with (security_invoker = on) as
select
  p.id                       as user_id,
  p.username,
  sum(c.points_earned)::int  as challenge_points,
  count(*)::int              as challenges_done
from public.st_challenge_completions c
join public.st_profiles p on p.id = c.user_id
where date_trunc('month', c.created_at) = date_trunc('month', now())
group by p.id, p.username
order by challenge_points desc;
