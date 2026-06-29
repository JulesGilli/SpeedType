import { useI18n } from '../lib/i18n';

interface HardcoreButtonProps {
  unlocked: boolean;
  onClick: () => void;
}

// Bouton d'accès au mode Hardcore, fixé en bas de l'écran (accueil).
const HardcoreButton: React.FC<HardcoreButtonProps> = ({ unlocked, onClick }) => {
  const { t } = useI18n();

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 group">
      <button
        onClick={unlocked ? onClick : undefined}
        disabled={!unlocked}
        className={`px-7 py-2.5 rounded-xl text-sm font-bold border shadow-lg transition-all
          ${unlocked
            ? 'bg-gradient-to-r from-red-600 to-orange-600 border-red-500/50 text-white hover:from-red-700 hover:to-orange-700 hover:scale-105'
            : 'bg-gray-800/70 backdrop-blur-md border-white/10 text-gray-500 cursor-not-allowed'}
        `}
      >
        {unlocked ? t('hardcore') : `🔒 ${t('hardcore')}`}
      </button>
      {!unlocked && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-xs text-gray-300 text-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          {t('hardcoreLocked')}
        </div>
      )}
    </div>
  );
};

export default HardcoreButton;
