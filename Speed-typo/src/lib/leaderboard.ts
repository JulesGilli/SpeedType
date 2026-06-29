import { supabase } from './supabase';
import { PlayMode } from '../types/GameMode';

export type LeaderboardPeriod = 'month' | 'all';

export interface LeaderboardRow {
  user_id: string;
  username: string;
  best_score: number;
  best_wpm: number;
  games_count: number;
}

export interface MyRankRow extends LeaderboardRow {
  rank: number;
}

export interface GlobalRow {
  user_id: string;
  username: string;
  total_score: number;
  modes_played: number;
}

export interface MyGlobalRow extends GlobalRow {
  rank: number;
}

// Appelle la fonction SQL st_leaderboard(period, mode).
export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  mode: PlayMode
): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('st_leaderboard', {
    p_period: period,
    p_mode: mode,
  });

  if (error) {
    console.error('[leaderboard] erreur de récupération:', error.message);
    return [];
  }

  return (data as LeaderboardRow[]) ?? [];
}

// Rang du joueur connecté (même hors top 10). Renvoie null s'il n'a aucun
// score sur cette période/ce mode, ou s'il n'est pas connecté.
export async function fetchMyRank(
  period: LeaderboardPeriod,
  mode: PlayMode
): Promise<MyRankRow | null> {
  const { data, error } = await supabase.rpc('st_my_rank', {
    p_period: period,
    p_mode: mode,
  });

  if (error) {
    console.error('[leaderboard] erreur rang joueur:', error.message);
    return null;
  }

  return (data as MyRankRow[])?.[0] ?? null;
}

// Classement global (somme des meilleurs scores par mode), tous modes confondus.
export async function fetchGlobalLeaderboard(
  period: LeaderboardPeriod
): Promise<GlobalRow[]> {
  const { data, error } = await supabase.rpc('st_global_leaderboard', {
    p_period: period,
  });
  if (error) {
    console.error('[leaderboard] erreur classement global:', error.message);
    return [];
  }
  return (data as GlobalRow[]) ?? [];
}

// Rang global du joueur connecté (même hors top 10). Null si non connecté/sans score.
export async function fetchMyGlobal(
  period: LeaderboardPeriod
): Promise<MyGlobalRow | null> {
  const { data, error } = await supabase.rpc('st_my_global', {
    p_period: period,
  });
  if (error) {
    console.error('[leaderboard] erreur rang global:', error.message);
    return null;
  }
  return (data as MyGlobalRow[])?.[0] ?? null;
}

// Classement HARDCORE : le classement général, restreint aux joueurs ayant
// débloqué le hardcore (score global >= min).
export async function fetchHardcoreLeaderboard(min: number): Promise<GlobalRow[]> {
  const { data, error } = await supabase.rpc('st_hardcore_leaderboard', { p_min: min });
  if (error) {
    console.error('[leaderboard] erreur classement hardcore:', error.message);
    return [];
  }
  return (data as GlobalRow[]) ?? [];
}

// Rang hardcore du joueur connecté (même hors top). Null si non connecté/sans score.
export async function fetchMyHardcore(min: number): Promise<MyGlobalRow | null> {
  const { data, error } = await supabase.rpc('st_my_hardcore', { p_min: min });
  if (error) {
    console.error('[leaderboard] erreur rang hardcore:', error.message);
    return null;
  }
  return (data as MyGlobalRow[])?.[0] ?? null;
}
