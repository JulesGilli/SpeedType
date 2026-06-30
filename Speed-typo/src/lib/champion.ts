import { supabase } from './supabase';

export interface Champion {
  message: string;
  author_name: string | null;
  updated_at: string;
}

export async function fetchChampion(): Promise<Champion | null> {
  const { data, error } = await supabase
    .from('st_champion')
    .select('message, author_name, updated_at')
    .eq('id', 1)
    .maybeSingle();
  if (error) {
    console.error('[champion] erreur de lecture:', error.message);
    return null;
  }
  return (data as Champion) ?? null;
}

// Réservé au #1 all-time (vérifié côté serveur ; lève une erreur sinon).
export async function setChampionMessage(message: string): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase.rpc('st_set_champion_message', { p_message: message });
  return { error };
}
