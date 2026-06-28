import { supabase } from './supabase';
import { GameResult } from '../types/GameResult';

// Enregistre le résultat d'une partie dans st_scores.
// La RLS exige user_id = auth.uid() : ça ne marche que pour l'utilisateur connecté.
export async function submitScore(result: GameResult, userId: string) {
  const { error } = await supabase.from('st_scores').insert({
    user_id: userId,
    mode: result.mode,
    score: result.score,
    wpm: result.wpm,
    accuracy: result.accuracy,
    word_count: result.wordCount,
  });

  if (error) {
    console.error('[scores] échec enregistrement du score:', error.message);
  }

  return { error };
}
