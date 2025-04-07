import React from 'react';
import { GameMode } from '../types/GameMode';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  const modes: GameMode[] = ['classique', 'inversé', 'leet'];

  return (
    <div className="flex justify-center gap-4 p-4">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onSelectMode(mode)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all
            ${selectedMode === mode
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default GameModeSelector;
