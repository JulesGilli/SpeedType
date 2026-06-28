import { createClient } from '@supabase/supabase-js';

// Renseigne ces variables dans un fichier `.env.local` (voir .env.example).
// La clé `anon` est publique par design : la sécurité passe par les règles RLS
// définies dans supabase/migrations/.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Permet à l'app de tourner même sans backend configuré (mode local).
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants. ' +
      'Les leaderboards et le login sont désactivés. Voir .env.example.'
  );
}

// Quand non configuré, on exporte un client "factice" non utilisé : les appels
// sont gardés derrière isSupabaseConfigured côté composants.
export const supabase = createClient(
  supabaseUrl ?? 'http://localhost',
  supabaseAnonKey ?? 'public-anon-key'
);
