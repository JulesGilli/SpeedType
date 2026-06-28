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
