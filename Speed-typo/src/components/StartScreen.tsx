import React from 'react';
import { motion } from 'framer-motion';
import GameModeSelector from './GameModeSelector';
import AuthBar from './AuthBar';
import { GameMode } from '../types/GameMode';

interface StartScreenProps {
  onStart: () => void;
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
}

const getModeDescription = (mode: GameMode): string[] => {
  switch (mode) {
    case 'classique':
      return [
        'Tape les mots qui s’affichent à l’écran.',
        'Tape vite pour enchaîner les combos et gagner plus de points !',
      ];
    case 'leet':
      return [
        'Certains mots auront des chiffres à la place des lettres (E → 3, A → 4, etc).',
        'Tape vite pour enchaîner les combos et gagner plus de points !',
      ];
    case 'inversé':
      return [
        'Certains mots seront écrits à l’envers (ex : "monde" devient "ednom").',
        'Tape vite pour enchaîner les combos et gagner plus de points !',
      ];
    case 'memoire':
      return [
        'Les mots s’affichent brièvement puis disparaissent.',
        'Lis-les rapidement, mémorise-les et tape-les de tête.',
      ];
    case 'blind':
      return [
        'Tu ne verras pas ce que tu tapes.',
        'Fais confiance à ta mémoire musculaire pour réussir.',
      ];
    case 'endless':
      return [
        'Un long texte défile en continu : tape-le sans t’arrêter.',
        'Va le plus loin possible avant la fin du temps — distance et WPM en direct !',
      ];
    default:
      return [];
  }
};

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  selectedMode,
  setSelectedMode,
}) => {
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
        Speed Typo
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
        <h2 className="text-xl font-semibold mb-4">Comment jouer</h2>
        <ul className="text-left space-y-2 mb-6">
          {getModeDescription(selectedMode).map((line, index) => (
            <li key={index} className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-lg font-bold hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          Commencer
        </motion.button>
      </motion.div>
    </div>
  );
};

export default StartScreen;
