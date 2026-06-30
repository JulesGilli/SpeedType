import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useI18n } from '../lib/i18n';
import { fetchChampion, setChampionMessage, Champion } from '../lib/champion';
import { fetchMyGlobal } from '../lib/leaderboard';

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

// Bannière du champion : message du #1 all-time, visible par tous en haut de page.
const ChampionBanner: React.FC = () => {
  const { user, configured } = useAuth();
  const { t } = useI18n();
  const [champ, setChamp] = useState<Champion | null>(null);
  const [isChampion, setIsChampion] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetchChampion().then(setChamp);
  };

  useEffect(() => {
    if (!configured) return;
    load();
    if (user) {
      fetchMyGlobal('all').then((r) => setIsChampion(r?.rank === 1));
    } else {
      setIsChampion(false);
    }
  }, [configured, user]);

  if (!configured) return null;

  const message = champ?.message?.trim() ?? '';
  const hasMessage = message.length > 0;

  // Rien à afficher pour les non-champions s'il n'y a pas de message.
  if (!hasMessage && !isChampion) return null;

  const startEdit = () => {
    setDraft(message);
    setEditing(true);
  };

  const publish = async () => {
    setSaving(true);
    const { error } = await setChampionMessage(draft.trim());
    setSaving(false);
    if (!error) {
      setEditing(false);
      load();
    }
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,640px)]">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/85 backdrop-blur-md border border-yellow-500/30 shadow-lg">
        <span className="text-[10px] font-bold text-yellow-400 tracking-widest shrink-0">N°1</span>

        {editing ? (
          <>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={200}
              placeholder={t('championPlaceholder')}
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') publish();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <button
              onClick={publish}
              disabled={saving}
              className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 hover:from-yellow-400 hover:to-amber-400 disabled:opacity-60 transition-all"
            >
              {t('publish')}
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 truncate text-sm text-gray-100">
              {hasMessage ? message : <span className="text-gray-400 italic">{t('championPrompt')}</span>}
            </span>
            {hasMessage && champ?.author_name && (
              <span className="shrink-0 text-xs text-gray-400">— {champ.author_name}</span>
            )}
            {isChampion && (
              <button
                onClick={startEdit}
                aria-label="edit"
                className="shrink-0 text-yellow-400/80 hover:text-yellow-300 transition-colors"
              >
                <PencilIcon />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChampionBanner;
