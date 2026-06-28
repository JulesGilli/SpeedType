import { useAuth } from '../lib/AuthContext';

// Petit logo Google (inline, pas de dépendance).
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8 20-20 0-1.3-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.8 35.8 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
  </svg>
);

const AuthBar = () => {
  const { configured, loading, user, profile, signInWithGoogle, signOut } = useAuth();

  // Backend non configuré : on n'affiche rien (le jeu reste jouable en local).
  if (!configured) return null;

  if (loading) {
    return <div className="text-sm text-gray-500 mb-4 h-9 flex items-center justify-center">…</div>;
  }

  if (!user) {
    return (
      <div className="mb-4 flex justify-center">
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-2 bg-white text-gray-800 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors"
        >
          <GoogleIcon />
          Se connecter avec Google
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="text-sm text-gray-300">
        Connecté :{' '}
        <span className="text-purple-400 font-semibold">{profile?.username ?? user.email}</span>
      </span>
      <button
        onClick={signOut}
        className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
      >
        Déconnexion
      </button>
    </div>
  );
};

export default AuthBar;
