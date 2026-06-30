import { useState } from 'react';
import RankingContent from './RankingContent';
import { useI18n } from '../lib/i18n';

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Dock "Rangs" (bas-gauche). Sur mobile : barre demi-largeur (à côté du dock
// Classement) + panneau plein largeur à l'ouverture.
const RankingDock: React.FC = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed z-40 bottom-12 sm:bottom-20 left-0 sm:left-4 w-full sm:w-96 overflow-y-auto nice-scroll
          bg-gray-800 border border-gray-700 rounded-t-xl sm:rounded-xl shadow-2xl transition-all duration-300 ease-out
          ${open ? 'max-h-[60vh] p-4 opacity-100' : 'max-h-0 p-0 opacity-0 pointer-events-none border-0'}
        `}
      >
        <RankingContent />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-0 sm:bottom-4 left-0 sm:left-4 w-1/2 sm:w-96 rounded-tr-lg sm:rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-4 py-3 flex items-center justify-between text-white font-semibold transition-colors"
      >
        <span className="truncate">{t('ranking')}</span>
        <Chevron open={open} />
      </button>
    </>
  );
};

export default RankingDock;
