# Supabase — Speed Typo

La base de données est gérée par **migrations** (dossier `migrations/`), appliquées
automatiquement par l'**intégration GitHub** de Supabase au merge sur `main`.

⚠️ Dans le dashboard Supabase → GitHub Integration, le **Working directory** doit être
réglé sur `Speed-typo` (et non `.`), car le dossier `supabase/` vit dans ce sous-dossier.

## Workflow

1. On ajoute/modifie un fichier `migrations/<timestamp>_xxx.sql`.
2. Commit + push sur `main`.
3. Supabase applique la migration à la base de production.

Ne jamais éditer une migration déjà appliquée : en créer une nouvelle.

## Tables (préfixe `st_` pour cohabiter avec un autre projet)

- `st_profiles` — pseudo public lié à chaque compte auth.
- `st_scores` — une ligne par partie (base des leaderboards).
- `st_challenges` — défis mensuels.
- `st_challenge_completions` — défis réussis (base du classement défis).

## Vues (classements)

- `st_leaderboard_weekly`, `st_leaderboard_monthly`, `st_challenge_leaderboard_monthly`.
