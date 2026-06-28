import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroGate from './components/IntroGate';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardDock from './components/LeaderboardDock';
import ChallengesDock from './components/ChallengesDock';
import Background from './components/Background';
import BackgroundToggle from './components/BackgroundToggle';
import { GameMode } from './types/GameMode';
import { GameResult } from './types/GameResult';
import { useAuth } from './lib/AuthContext';
import { submitScore } from './lib/scores';
import { claimChallenges, ClaimedChallenge } from './lib/challenges';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'anon';

function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [result, setResult] = useState<GameResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [claimed, setClaimed] = useState<ClaimedChallenge[]>([]);

  const [selectedMode, setSelectedMode] = useState<GameMode>('classique');
  const [unlocked, setUnlocked] = useState(false);
  const [bgEnabled, setBgEnabled] = useState<boolean>(
    () => localStorage.getItem('st_bg_enabled') !== 'false'
  );

  const toggleBackground = (value: boolean) => {
    setBgEnabled(value);
    localStorage.setItem('st_bg_enabled', String(value));
  };

  const { user, configured } = useAuth();

  const startGame = () => {
    setGameState('playing');
  };

  const endGame = (gameResult: GameResult) => {
    setResult(gameResult);
    setGameState('result');
    setClaimed([]);

    // Enregistrement du score : seulement si le backend est configuré ET connecté.
    if (!configured || !user) {
      setSaveStatus('anon');
      return;
    }

    setSaveStatus('saving');
    submitScore(gameResult, user.id).then(({ error }) => {
      setSaveStatus(error ? 'error' : 'saved');
      // Une fois le score enregistré, on valide les défis atteints.
      if (!error) {
        claimChallenges().then(setClaimed);
      }
    });
  };

  const restartGame = () => {
    setGameState('start');
  };

  return (
    <div className="relative w-full min-h-screen text-white">
      <Background enabled={bgEnabled} />

      <AnimatePresence mode="wait">
        {!unlocked ? (
          <IntroGate key="intro" onUnlock={() => setUnlocked(true)} />
        ) : (
          <motion.div
            key="app"
            className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
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
        <ResultScreen
          result={result}
          saveStatus={saveStatus}
          claimed={claimed}
          onRestart={restartGame}
        />
      )}

      {/* Docks + toggle de fond : toujours présents sur l'accueil */}
      {gameState === 'start' && (
        <>
          <BackgroundToggle enabled={bgEnabled} onToggle={toggleBackground} />
          <LeaderboardDock />
          <ChallengesDock />
        </>
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
