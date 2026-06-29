import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroGate from './components/IntroGate';
import StartScreen from './components/StartScreen';
import HardcoreScreen from './components/HardcoreScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardDock from './components/LeaderboardDock';
import ChallengesDock from './components/ChallengesDock';
import Background from './components/Background';
import BackgroundToggle from './components/BackgroundToggle';
import LanguageSelector from './components/LanguageSelector';
import HardcoreButton from './components/HardcoreButton';
import { GameMode, PlayMode } from './types/GameMode';
import { GameResult } from './types/GameResult';
import { useAuth } from './lib/AuthContext';
import { submitScore } from './lib/scores';
import { claimChallenges, ClaimedChallenge } from './lib/challenges';
import { fetchMyGlobal } from './lib/leaderboard';
import { isHardcoreUnlocked } from './lib/rank';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'anon';

type GameState = 'start' | 'hardcore' | 'playing' | 'result';

const screenAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
};

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [result, setResult] = useState<GameResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [claimed, setClaimed] = useState<ClaimedChallenge[]>([]);

  const [selectedMode, setSelectedMode] = useState<GameMode>('classique');
  const [playMode, setPlayMode] = useState<PlayMode>('classique');
  const [hardcore, setHardcore] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [globalScore, setGlobalScore] = useState(0);
  const [bgEnabled, setBgEnabled] = useState<boolean>(
    () => localStorage.getItem('st_bg_enabled') !== 'false'
  );

  const toggleBackground = (value: boolean) => {
    setBgEnabled(value);
    localStorage.setItem('st_bg_enabled', String(value));
  };

  const { user, configured } = useAuth();

  // Score global du joueur (pour débloquer le Hardcore au rang Master).
  useEffect(() => {
    if (!configured || !user) {
      setGlobalScore(0);
      return;
    }
    let cancelled = false;
    fetchMyGlobal('month').then((r) => {
      if (!cancelled) setGlobalScore(r?.total_score ?? 0);
    });
    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  // DEV: hardcore débloqué pour les tests. Remettre isHardcoreUnlocked(globalScore) pour la prod.
  const hardcoreUnlocked = true || isHardcoreUnlocked(globalScore);

  const startGame = (mode: PlayMode) => {
    setPlayMode(mode);
    setGameState('playing');
  };

  const endGame = (gameResult: GameResult) => {
    setResult(gameResult);
    setGameState('result');
    setClaimed([]);

    if (!configured || !user) {
      setSaveStatus('anon');
      return;
    }

    setSaveStatus('saving');
    submitScore(gameResult, user.id).then(({ error }) => {
      setSaveStatus(error ? 'error' : 'saved');
      // Les défis ne se valident que sur les modes normaux (pas en hardcore).
      if (!error && !hardcore) {
        claimChallenges().then(setClaimed);
      }
    });
  };

  // Retour après une partie : menu Hardcore si on y est, sinon accueil.
  const afterGame = () => setGameState(hardcore ? 'hardcore' : 'start');

  const exitHardcore = () => {
    setHardcore(false);
    setGameState('start');
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden">
      <Background enabled={bgEnabled} hardcore={hardcore} />

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
            <AnimatePresence mode="wait">
              {gameState === 'start' && (
                <motion.div key="start" className="w-full flex justify-center" {...screenAnim}>
                  <StartScreen
                    onStart={() => startGame(selectedMode)}
                    selectedMode={selectedMode}
                    setSelectedMode={setSelectedMode}
                  />
                </motion.div>
              )}

              {gameState === 'hardcore' && (
                <motion.div key="hardcore" className="w-full flex justify-center" {...screenAnim}>
                  <HardcoreScreen onPick={(m) => startGame(m)} onBack={exitHardcore} />
                </motion.div>
              )}

              {gameState === 'playing' && (
                <motion.div key="playing" className="w-full flex justify-center" {...screenAnim}>
                  <GameScreen
                    selectedMode={playMode}
                    hardcore={hardcore}
                    onStop={afterGame}
                    onGameEnd={endGame}
                  />
                </motion.div>
              )}

              {gameState === 'result' && result && (
                <motion.div key="result" className="w-full flex justify-center" {...screenAnim}>
                  <ResultScreen
                    result={result}
                    saveStatus={saveStatus}
                    claimed={claimed}
                    hardcore={hardcore}
                    onRestart={afterGame}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Docks + contrôles : uniquement sur l'accueil classique */}
            {gameState === 'start' && (
              <>
                <LanguageSelector />
                <BackgroundToggle enabled={bgEnabled} onToggle={toggleBackground} />
                <HardcoreButton
                  unlocked={hardcoreUnlocked}
                  onClick={() => {
                    setHardcore(true);
                    setGameState('hardcore');
                  }}
                />
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
