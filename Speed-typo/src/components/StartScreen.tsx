import React from 'react';
import GameModeSelector from './GameModeSelector';
import { GameMode } from '../types/GameMode';

interface StartScreenProps {
  onStart: () => void;
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  selectedMode,
  setSelectedMode,
}) => {
  return (
    <div className="max-w-md w-full text-center">
      <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Speed Typo
      </h1>

      <GameModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Comment jouer</h2>
        <ul className="text-left space-y-2 mb-6">
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Tape les mots qui s’affichent à l’écran</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Certains mots auront des chiffres à la place des lettres (E→3, A→4)</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Certains mots seront à l’envers</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Tape vite pour enchaîner les combos et gagner plus de points !</span>
          </li>
        </ul>

        <button
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-lg font-bold hover:from-purple-600 hover:to-pink-600 transform transition-all hover:scale-105 shadow-lg"
        >
          Commencer
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
