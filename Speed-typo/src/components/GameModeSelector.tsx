import React from 'react';
import { GameMode } from '../types/GameMode';
import { useI18n } from '../lib/i18n';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  const { modeLabel } = useI18n();
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
              : 'bg-white/10 text-gray-200 border border-white/10 backdrop-blur-sm hover:bg-white/20'}
          `}
        >
          {modeLabel(mode)}
        </button>
      ))}
    </div>
  );
};

export default GameModeSelector;
