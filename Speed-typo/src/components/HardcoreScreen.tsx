import { motion } from 'framer-motion';
import { HardcoreMode } from '../types/GameMode';
import { useI18n } from '../lib/i18n';

interface HardcoreScreenProps {
  onPick: (mode: HardcoreMode) => void;
  onBack: () => void;
}

const HardcoreScreen: React.FC<HardcoreScreenProps> = ({ onPick, onBack }) => {
  const { t } = useI18n();

  const cards: { mode: HardcoreMode; title: string; desc: string }[] = [
    { mode: 'chaos', title: t('chaosTitle'), desc: t('chaosDesc') },
    { mode: 'sudden', title: t('suddenTitle'), desc: t('suddenDesc') },
  ];

  return (
    <div className="max-w-2xl w-full text-center">
      <motion.h1
        className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-tight"
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 130, damping: 14 }}
      >
        {t('hardcore')}
      </motion.h1>
      <p className="text-sm text-red-300/80 mb-8">{t('hardcoreChoose')}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.button
            key={c.mode}
            onClick={() => onPick(c.mode)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="text-left p-5 rounded-2xl bg-red-500/5 border border-red-500/30 hover:border-red-400/70 hover:bg-red-500/10 transition-colors shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(239,68,68,0.12)' }}
          >
            <div className="text-2xl font-bold text-red-300 mb-2">{c.title}</div>
            <div className="text-sm text-gray-300">{c.desc}</div>
          </motion.button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="text-sm px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
      >
        {t('back')}
      </button>
    </div>
  );
};

export default HardcoreScreen;
