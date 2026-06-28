import { supabase } from './supabase';
import { GameMode } from '../types/GameMode';

export type LeaderboardPeriod = 'week' | 'month' | 'all';

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

// Appelle la fonction SQL st_leaderboard(period, mode).
export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  mode: GameMode
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
  mode: GameMode
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
