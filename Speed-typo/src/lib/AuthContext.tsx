import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

interface Profile {
  id: string;
  username: string;
  username_set: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  // True quand un user est connecté mais n'a pas encore choisi son pseudo
  // (cas typique : 1re connexion Google → pseudo provisoire à confirmer).
  needsUsername: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: { message: string } | null }>;
  updateUsername: (username: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Si le backend n'est pas configuré, on ne reste pas bloqué sur un écran de chargement.
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('st_profiles')
      .select('id, username, username_set')
      .eq('id', userId)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
  };

  // Charge le pseudo public (st_profiles) à chaque changement d'utilisateur.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from('st_profiles')
      .select('id, username, username_set')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile((data as Profile) ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signInWithGoogle = async () => {
    // Redirige vers Google puis revient sur l'app (en respectant la base Vite).
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
  };

  const signInWithEmail = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  // Inscription email/mot de passe ; le username part dans les métadonnées
  // (le trigger st_handle_new_user crée le profil avec).
  const signUpWithEmail = (email: string, password: string, username: string) =>
    supabase.auth.signUp({ email, password, options: { data: { username } } });

  // Définit le pseudo choisi par l'utilisateur (marque le profil comme finalisé).
  // Renvoie l'erreur 'taken' si le pseudo est déjà pris (contrainte d'unicité).
  const updateUsername = async (username: string) => {
    const userId = session?.user?.id;
    if (!userId) return { error: { message: 'not-signed-in' } };

    const { error } = await supabase
      .from('st_profiles')
      .update({ username: username.trim(), username_set: true })
      .eq('id', userId);

    if (error) {
      return { error: { message: error.code === '23505' ? 'taken' : error.message } };
    }
    await loadProfile(userId);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const needsUsername =
    isSupabaseConfigured && !!session?.user && !!profile && !profile.username_set;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        configured: isSupabaseConfigured,
        needsUsername,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        updateUsername,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return ctx;
}
