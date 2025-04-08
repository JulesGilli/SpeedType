import React from 'react';
import { GameMode } from '../types/GameMode';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

const getModeLabel = (mode: GameMode) => {
  switch (mode) {
    case 'classique':
      return 'Classique';
    case 'inversé':
      return 'Inversé';
    case 'leet':
      return 'Leet';
    case 'memoire':
      return 'Mémoire';
    case 'blind':
      return 'Blind';
    case 'endless':
      return 'Phrase infinie';
    default:
      return mode;
  }
};

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  const modes: GameMode[] = ['classique', 'inversé', 'leet', 'memoire', 'blind', 'endless'];

  return (
    <div className="flex justify-center gap-4 p-4 flex-wrap">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onSelectMode(mode)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow
            ${selectedMode === mode
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
          `}
        >
          {getModeLabel(mode)}
        </button>
      ))}
    </div>
  );
};

export default GameModeSelector;
