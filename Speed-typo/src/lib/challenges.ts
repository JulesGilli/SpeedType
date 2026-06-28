import { supabase } from './supabase';

export interface ChallengeRow {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  mode: string | null;
  goal_type: string;
  goal_value: number;
  base_points: number;
  completed: boolean;
  points_earned: number;
}

export interface ClaimedChallenge {
  challenge_id: number;
  title: string;
  points_earned: number;
}

export interface ChallengeRankRow {
  user_id: string;
  username: string;
  challenge_points: number;
  challenges_done: number;
}

// Défis du mois + statut de complétion. `ensure` génère les défis du mois
// (réservé aux connectés — on le saute pour les visiteurs anonymes).
export async function fetchMyChallenges(ensure: boolean): Promise<ChallengeRow[]> {
  if (ensure) {
    await supabase.rpc('st_ensure_month_challenges');
  }
  const { data, error } = await supabase.rpc('st_my_challenges');
  if (error) {
    console.error('[challenges] erreur my_challenges:', error.message);
    return [];
  }
  return (data as ChallengeRow[]) ?? [];
}

// Valide côté serveur les défis atteints et renvoie les nouveaux validés.
export async function claimChallenges(): Promise<ClaimedChallenge[]> {
  const { data, error } = await supabase.rpc('st_claim_challenges');
  if (error) {
    console.error('[challenges] erreur claim:', error.message);
    return [];
  }
  return (data as ClaimedChallenge[]) ?? [];
}

// Classement mensuel par points de défis.
export async function fetchChallengeLeaderboard(): Promise<ChallengeRankRow[]> {
  const { data, error } = await supabase
    .from('st_challenge_leaderboard_monthly')
    .select('*')
    .limit(100);
  if (error) {
    console.error('[challenges] erreur classement défis:', error.message);
    return [];
  }
  return (data as ChallengeRankRow[]) ?? [];
}
