import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import { GameResult } from '../../types/GameResult';
import {
  loadProgress,
  saveProgress,
  addGold,
  deckCards,
  recordBestPhase,
  BossProgress,
} from '../../lib/boss/bossProgress';
import { computeWpm } from '../../utils/gameUtils';
import BossLobby from './BossLobby';
import BossArena, { BossOutcome } from './BossArena';

interface BossModeProps {
  onGameEnd: (result: GameResult) => void;
  onStop: () => void;
}

type Screen = 'lobby' | 'battle' | 'debrief';

// Score du leaderboard pour le mode Boss : dégâts infligés + bonus par phase,
// gros bonus si le boss est vaincu.
const computeBossScore = (o: BossOutcome) =>
  Math.round(o.damageDealt * 8 + o.phasesCleared * 400 + (o.win ? 3000 : 0));

const BossMode: React.FC<BossModeProps> = ({ onGameEnd, onStop }) => {
  const { t } = useI18n();
  const [progress, setProgressState] = useState<BossProgress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>('lobby');
  const [outcome, setOutcome] = useState<BossOutcome | null>(null);
  const [newRecord, setNewRecord] = useState(false);

  // Sauvegarde à chaque mutation de progression.
  const setProgress = (p: BossProgress) => {
    setProgressState(p);
    saveProgress(p);
  };

  const deck = useMemo(() => deckCards(progress), [progress]);

  const handleBattleEnd = (o: BossOutcome) => {
    setOutcome(o);
    setNewRecord(o.reachedPhase > progress.bestPhase);
    // L'or gagné est crédité + on mémorise la meilleure phase atteinte.
    setProgress(recordBestPhase(addGold(progress, o.goldEarned), o.reachedPhase));
    setScreen('debrief');
  };

  // "Valider le score" : on remonte le résultat à l'app (leaderboard + écran résultat global).
  const validateScore = () => {
    if (!outcome) return;
    const result: GameResult = {
      mode: 'boss',
      score: computeBossScore(outcome),
      wordCount: outcome.wordsTyped,
      accuracy: 100,
      wpm: computeWpm(outcome.wordsTyped * 5, Math.max(1, outcome.durationSec)),
      maxCombo: outcome.phasesCleared,
      durationSec: outcome.durationSec,
    };
    onGameEnd(result);
  };

  if (screen === 'lobby') {
    return (
      <BossLobby
        progress={progress}
        setProgress={setProgress}
        onFight={() => setScreen('battle')}
        onBack={onStop}
      />
    );
  }

  if (screen === 'battle') {
    return <BossArena deck={deck} onEnd={handleBattleEnd} onQuit={() => setScreen('lobby')} />;
  }

  // Débriefing
  return (
    <motion.div className="max-w-md w-full text-center"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-7xl mb-3">{outcome?.win ? '🏆' : '💀'}</div>
      <h1 className={`text-4xl font-extrabold mb-2 text-transparent bg-clip-text ${outcome?.win ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-red-500 to-gray-500'}`}>
        {outcome?.win ? t('bossVictory') : t('bossDefeat')}
      </h1>
      {newRecord && !outcome?.win && (
        <div className="text-sm font-bold text-yellow-300 mb-1 animate-pulse">
          ⭐ {t('bossNewRecord')} — {t('bossPhase')} {outcome?.reachedPhase}/{outcome?.totalPhases}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 my-6 text-left">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs text-gray-400">{t('bossPhasesCleared')}</div>
          <div className="text-xl font-bold">{outcome?.phasesCleared}/{outcome?.totalPhases}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs text-gray-400">{t('bossDamageDealt')}</div>
          <div className="text-xl font-bold text-red-300">{outcome?.damageDealt}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs text-gray-400">{t('words')}</div>
          <div className="text-xl font-bold">{outcome?.wordsTyped}</div>
        </div>
        <div className="rounded-lg bg-yellow-500/10 p-3 ring-1 ring-yellow-500/30">
          <div className="text-xs text-yellow-400/80">{t('bossGoldEarned')}</div>
          <div className="text-xl font-bold text-yellow-300">+{outcome?.goldEarned} 🪙</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={() => { setOutcome(null); setScreen('lobby'); }}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110">
          {t('bossBackToLobby')}
        </button>
        <button onClick={validateScore}
          className="w-full py-2.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20">
          {t('bossValidateScore')}
        </button>
      </div>
    </motion.div>
  );
};

export default BossMode;
