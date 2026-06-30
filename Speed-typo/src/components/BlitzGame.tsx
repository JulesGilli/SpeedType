import { useEffect, useRef, useState } from 'react';
import WordDisplay from './WordDisplay';
import { getRandomWord, getShortWord, calculateScore, computeWpm } from '../utils/gameUtils';
import { GameResult } from '../types/GameResult';
import { useI18n } from '../lib/i18n';

interface BlitzGameProps {
  onGameEnd: (result: GameResult) => void;
  onStop: () => void;
}

const START_BUDGET = 5000; // ms pour le 1er mot
const MIN_BUDGET = 800; // plancher
const DECAY = 0.95; // -5% par mot
const BONUS_CHANCE = 0.6;
const BONUS_PER_CHAR = 15;

// Mode Hardcore "Blitz" : un temps par mot qui diminue de 10% à chaque mot,
// + un mot bonus optionnel à taper avant le mot principal pour des points.
const BlitzGame: React.FC<BlitzGameProps> = ({ onGameEnd, onStop }) => {
  const { t } = useI18n();

  const [main, setMain] = useState('');
  const [bonus, setBonus] = useState<string | null>(null);
  const [bonusGrabbed, setBonusGrabbed] = useState(false);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [words, setWords] = useState(0);
  const [remaining, setRemaining] = useState(START_BUDGET);
  const [shake, setShake] = useState(false);

  // Sources de vérité pour la fin de partie (évite les closures périmées du timer).
  const scoreRef = useRef(0);
  const wordsRef = useRef(0);
  const comboRef = useRef(0);
  const correctCharsRef = useRef(0);
  const errorsRef = useRef(0);
  const maxComboRef = useRef(0);
  const budgetRef = useRef(START_BUDGET);
  const deadlineRef = useRef(0);
  const wordStartRef = useRef(0);
  const startRef = useRef(0);
  const endedRef = useRef(false);
  const inputElRef = useRef<HTMLInputElement>(null);

  const newWord = () => {
    setMain(getRandomWord('blitz'));
    // Mot bonus = mot court (≤6 lettres), rapide à choper avant le mot principal.
    setBonus(Math.random() < BONUS_CHANCE ? getShortWord() : null);
    setBonusGrabbed(false);
    setInput('');
    wordStartRef.current = Date.now();
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    const elapsed = Math.max(1, (Date.now() - startRef.current) / 1000);
    const total = wordsRef.current + errorsRef.current;
    const accuracy = total > 0 ? Math.round((wordsRef.current / total) * 100) : 100;
    onGameEnd({
      mode: 'blitz',
      score: scoreRef.current,
      wordCount: wordsRef.current,
      accuracy,
      wpm: computeWpm(correctCharsRef.current, elapsed),
      maxCombo: maxComboRef.current,
      durationSec: Math.round(elapsed),
    });
  };

  useEffect(() => {
    startRef.current = Date.now();
    budgetRef.current = START_BUDGET;
    deadlineRef.current = Date.now() + START_BUDGET;
    newWord();
    inputElRef.current?.focus();

    const id = setInterval(() => {
      const rem = deadlineRef.current - Date.now();
      if (rem <= 0) {
        setRemaining(0);
        clearInterval(id);
        finish();
        return;
      }
      setRemaining(rem);
    }, 50);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
  };

  const grabBonus = () => {
    if (!bonus) return;
    const pts = bonus.length * BONUS_PER_CHAR;
    scoreRef.current += pts;
    setScore(scoreRef.current);
    correctCharsRef.current += bonus.length;
    setBonusGrabbed(true);
    setInput('');
  };

  const completeMain = () => {
    const timeTaken = (Date.now() - wordStartRef.current) / 1000;
    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    setCombo(newCombo);
    maxComboRef.current = Math.max(maxComboRef.current, newCombo);

    const wordScore = calculateScore(main.length, timeTaken, newCombo);
    scoreRef.current += wordScore;
    setScore(scoreRef.current);
    correctCharsRef.current += main.length;
    wordsRef.current += 1;
    setWords(wordsRef.current);

    // Accélération : le temps par mot diminue de 10%.
    budgetRef.current = Math.max(MIN_BUDGET, budgetRef.current * DECAY);
    deadlineRef.current = Date.now() + budgetRef.current;
    setRemaining(budgetRef.current);

    newWord();
  };

  const handleChange = (value: string) => {
    setInput(value);
    const ci = value.trim().toLowerCase();
    if (ci.length === 0) return;

    const mainT = main.toLowerCase();
    const bonusActive = !!bonus && !bonusGrabbed;
    const bonusT = bonus?.toLowerCase() ?? '';

    if (bonusActive && ci === bonusT) {
      grabBonus();
      return;
    }
    if (ci === mainT) {
      completeMain();
      return;
    }
    // Faute (plus aucun mot ne commence par ce qui est tapé) : on efface.
    const okMain = mainT.startsWith(ci);
    const okBonus = bonusActive && bonusT.startsWith(ci);
    if (!okMain && !okBonus) {
      errorsRef.current += 1;
      comboRef.current = 0;
      setCombo(0);
      setInput('');
      triggerShake();
    }
  };

  const ratio = Math.max(0, Math.min(1, remaining / budgetRef.current));
  const seconds = (remaining / 1000).toFixed(1);
  const low = remaining <= 1500;

  return (
    <div className="max-w-2xl w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">
          {t('score')}: <span className="text-red-400 animate-pulse">{score}</span>
        </div>
        <div className="text-xl font-bold">
          <span className={low ? 'text-red-500' : 'text-orange-400'}>{seconds}s</span>
        </div>
        <button
          onClick={onStop}
          className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          {t('quit')}
        </button>
      </div>

      {/* Barre de temps du mot courant */}
      <div className="w-full h-2 bg-gray-700/70 rounded-full overflow-hidden mb-5">
        <div
          className={`h-full transition-all duration-75 ${low ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <div
        className={`bg-gray-800 p-6 rounded-lg shadow-lg relative overflow-hidden select-none ring-1 ring-red-500/40 ${shake ? 'animate-shake' : ''}`}
      >
        {/* Mot bonus (au-dessus) */}
        <div className="h-12 flex items-center justify-center mb-2">
          {bonus && !bonusGrabbed ? (
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-yellow-500/80">{t('bonus')}</div>
              <div className="text-xl font-bold text-yellow-400">{bonus}</div>
            </div>
          ) : (
            <div className="text-yellow-400/40 text-sm">{bonusGrabbed ? '+ bonus !' : ''}</div>
          )}
        </div>

        <div className="mb-6 text-center">
          <div className="text-sm text-gray-400 mb-2">{t('typeThisWord')}</div>
          <WordDisplay word={main} />
        </div>

        <input
          ref={inputElRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full bg-gray-700 text-center text-2xl py-4 px-6 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 hover:bg-gray-600"
        />

        <div className="mt-6 flex justify-between text-sm">
          <div>
            {t('words')}: <span className="text-green-400">{words}</span>
          </div>
          <div>
            {t('combo')}:{' '}
            <span className={combo >= 5 ? 'text-red-400 animate-pulse font-bold' : 'text-gray-400'}>
              {combo}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlitzGame;
