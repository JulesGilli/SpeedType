import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardDock from './components/LeaderboardDock';
import { GameMode } from './types/GameMode';
import { GameResult } from './types/GameResult';
import { useAuth } from './lib/AuthContext';
import { submitScore } from './lib/scores';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'anon';

function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [result, setResult] = useState<GameResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const [selectedMode, setSelectedMode] = useState<GameMode>('classique');

  const { user, configured } = useAuth();

  const startGame = () => {
    setGameState('playing');
  };

  const endGame = (gameResult: GameResult) => {
    setResult(gameResult);
    setGameState('result');

    // Enregistrement du score : seulement si le backend est configuré ET connecté.
    if (!configured || !user) {
      setSaveStatus('anon');
      return;
    }

    setSaveStatus('saving');
    submitScore(gameResult, user.id).then(({ error }) => {
      setSaveStatus(error ? 'error' : 'saved');
    });
  };

  const restartGame = () => {
    setGameState('start');
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {gameState === 'start' && (
        <StartScreen
          onStart={startGame}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />
      )}
      {gameState === 'playing' && (
        <GameScreen
          selectedMode={selectedMode}
          onStop={restartGame}
          onGameEnd={endGame}
        />
      )}
      {gameState === 'result' && result && (
        <ResultScreen result={result} saveStatus={saveStatus} onRestart={restartGame} />
      )}

      {/* Dock classement : toujours présent sur l'accueil */}
      {gameState === 'start' && <LeaderboardDock />}
    </div>
  );
}

export default App;
