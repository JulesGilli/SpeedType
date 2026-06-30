import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';

const inputClass =
  'w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

// Affichée à la 1re connexion (notamment Google) pour que l'utilisateur choisisse
// son pseudo plutôt que de garder celui dérivé automatiquement de son email.
const UsernameModal: React.FC = () => {
  const { t } = useI18n();
  const { profile, updateUsername } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();
    if (clean.length < 3) {
      setError(t('usernameTooShort'));
      return;
    }
    setError(null);
    setBusy(true);
    const { error } = await updateUsername(clean);
    setBusy(false);
    if (error) {
      setError(error.message === 'taken' ? t('usernameTaken') : error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {t('chooseUsernameTitle')}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-5">{t('chooseUsernamePrompt')}</p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            autoFocus
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('usernameField')}
            className={inputClass}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 transition-all"
          >
            {t('confirmUsername')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UsernameModal;
