import { useState } from 'react';
import HardcoreLeaderboardContent from './HardcoreLeaderboardContent';
import { useI18n } from '../lib/i18n';

// Dock "Classement" version Hardcore : même comportement que le dock classique
// mais en DA rouge et avec le classement par mode hardcore (chaos / mort subite).
// Affiché uniquement en mode hardcore, à la place du dock classique.
const HardcoreLeaderboardDock: React.FC = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-96">
      <div className="flex flex-col rounded-t-xl sm:rounded-xl overflow-hidden shadow-2xl border border-red-500/30">
        {/* Contenu : visible au-dessus de la barre quand déplié */}
        <div
          className={`bg-gray-900 overflow-y-auto nice-scroll transition-all duration-300 ease-out
            ${open ? 'max-h-[65vh] p-4' : 'max-h-0 p-0'}
          `}
        >
          <HardcoreLeaderboardContent />
        </div>

        {/* Barre cliquable */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-4 py-3 flex items-center justify-between text-white font-semibold transition-colors"
        >
          <span>
            {t('leaderboard')} · {t('hardcore')}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HardcoreLeaderboardDock;
