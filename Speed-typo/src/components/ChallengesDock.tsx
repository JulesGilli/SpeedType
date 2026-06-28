import { useState } from 'react';
import ChallengesContent from './ChallengesContent';
import { useI18n } from '../lib/i18n';

// Dock "Défis du mois" repliable, ancré en bas à gauche de l'accueil.
const ChallengesDock: React.FC = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 sm:bottom-4 sm:left-4 z-50 w-full sm:w-96">
      <div className="flex flex-col rounded-t-xl sm:rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        <div
          className={`bg-gray-800 overflow-y-auto nice-scroll transition-all duration-300 ease-out
            ${open ? 'max-h-[65vh] p-4' : 'max-h-0 p-0'}
          `}
        >
          <ChallengesContent />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-4 py-3 flex items-center justify-between text-white font-semibold transition-colors"
        >
          <span>{t('challengesMonth')}</span>
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

export default ChallengesDock;
