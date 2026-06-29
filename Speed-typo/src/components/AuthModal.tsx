import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  onSkip: () => void;
  onAuthed: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8 20-20 0-1.3-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.8 35.8 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
  </svg>
);

const inputClass =
  'w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSkip, onAuthed }) => {
  const { t } = useI18n();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res =
      mode === 'in'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, username || email.split('@')[0]);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onAuthed();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {t('loginTitle')}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-5">{t('loginPrompt')}</p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-medium px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GoogleIcon />
          {t('connectGoogle')}
        </button>

        <div className="flex items-center gap-3 my-4 text-xs text-gray-500">
          <div className="flex-1 h-px bg-white/10" />
          {t('orWord')}
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'up' && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('usernameField')}
              className={inputClass}
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email')}
            className={inputClass}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password')}
            className={inputClass}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 transition-all"
          >
            {mode === 'in' ? t('signIn') : t('signUp')}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in');
            setError(null);
          }}
          className="w-full text-xs text-gray-400 hover:text-white mt-3 transition-colors"
        >
          {mode === 'in' ? t('toSignUp') : t('toSignIn')}
        </button>

        <button
          onClick={onSkip}
          className="block w-full text-sm text-gray-400 hover:text-white mt-4 underline underline-offset-4 transition-colors"
        >
          {t('playAsGuest')}
        </button>
      </motion.div>
    </div>
  );
};

export default AuthModal;
