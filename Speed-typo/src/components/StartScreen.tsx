import React from 'react';
import { motion } from 'framer-motion';
import GameModeSelector from './GameModeSelector';
import AuthBar from './AuthBar';
import Typewriter from './Typewriter';
import { GameMode } from '../types/GameMode';
import { useI18n } from '../lib/i18n';

interface StartScreenProps {
  onStart: () => void;
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
  onHardcore: () => void;
  hardcoreUnlocked: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  selectedMode,
  setSelectedMode,
  onHardcore,
  hardcoreUnlocked,
}) => {
  const { t, modeDesc } = useI18n();
  const lines = modeDesc(selectedMode);

  return (
    <div className="max-w-md w-full text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <AuthBar />
      </motion.div>

      <motion.h1
        className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
      >
        <Typewriter text="SpeedType" speed={70} startDelay={150} />
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GameModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
      </motion.div>

      <motion.div
        className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl mb-8 shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-semibold mb-4">
          <Typewriter text={t('howToPlay')} startDelay={900} />
        </h2>
        <ul className="text-left space-y-2 mb-6 min-h-[3.5rem]">
          {lines.map((line, index) => (
            <li key={`${selectedMode}-${index}`} className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>
                <Typewriter text={line} startDelay={1100 + index * 700} />
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-lg font-bold hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            {t('start')}
          </motion.button>

          {/* Mode Hardcore : grisé + tooltip tant que le rang Master n'est pas atteint */}
          <div className="group relative">
            <button
              onClick={hardcoreUnlocked ? onHardcore : undefined}
              disabled={!hardcoreUnlocked}
              className={`px-6 py-2 rounded-lg text-sm font-bold border transition-all
                ${hardcoreUnlocked
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 border-red-500/50 text-white hover:from-red-700 hover:to-orange-700 cursor-pointer'
                  : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'}
              `}
            >
              {hardcoreUnlocked ? `🔥 ${t('hardcore')}` : `🔒 ${t('hardcore')}`}
            </button>
            {!hardcoreUnlocked && (
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20">
                {t('hardcoreLocked')}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StartScreen;
