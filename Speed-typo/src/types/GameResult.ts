// src/types/GameResult.ts
import { GameMode } from './GameMode';

// Résultat complet d'une partie — sert d'écran de résultat ET de payload pour
// l'envoi des scores au leaderboard (Supabase).
export interface GameResult {
  mode: GameMode;
  score: number;
  wordCount: number;
  accuracy: number; // pourcentage 0-100
  wpm: number; // mots par minute (chars corrects / 5 / minutes)
  durationSec: number;
}
