import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import { GameMode } from './types/GameMode';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classique');

  const startGame = () => {
    setIsPlaying(true);
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  const handleGameEnd = (score: number, totalWords: number, accuracy: number) => {
    console.log('🎮 Fin de partie !');
    console.log('🏆 Score final :', score);
    console.log('📝 Mots réussis :', totalWords);
    console.log('🎯 Précision :', accuracy + '%');
    setIsPlaying(false); // Retour à l'écran d'accueil
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      {!isPlaying ? (
        <StartScreen
          onStart={startGame}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />
      ) : (
        <GameScreen
          selectedMode={selectedMode}
          onStop={stopGame}
          onGameEnd={handleGameEnd}
        />
      )}
    </div>
  );
}

export default App;
