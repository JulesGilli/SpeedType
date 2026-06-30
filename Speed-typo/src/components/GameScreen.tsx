import React, { useEffect, useState, useRef } from 'react';
import WordDisplay from './WordDisplay';
import ParticleEffect from './ParticleEffect';
import FloatingScore from './FloatingScore';
import { getRandomWord, modifyWord, calculateScore, computeWpm } from '../utils/gameUtils';
import { PlayMode } from '../types/GameMode';
import { GameResult } from '../types/GameResult';
import { useI18n } from '../lib/i18n';
import EndlessPhraseGame from './EndlessPhraseGame';
import BlitzGame from './BlitzGame';
import BossMode from './boss/BossMode';

const GAME_DURATION = 60;

interface GameScreenProps {
  onGameEnd: (result: GameResult) => void;
  selectedMode: PlayMode;
  onStop: () => void;
  hardcore?: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd, selectedMode, onStop, hardcore = false }) => {
  if (selectedMode === 'endless') {
    return <EndlessPhraseGame onGameEnd={onGameEnd} onStop={onStop} />;
  }
  if (selectedMode === 'blitz') {
    return <BlitzGame onGameEnd={onGameEnd} onStop={onStop} />;
  }
  if (selectedMode === 'boss') {
    return <BossMode onGameEnd={onGameEnd} onStop={onStop} />;
  }

  const { t } = useI18n();
  // Comportements combinés (mode Chaos = tous à la fois) + mort subite.
  const isMemory = selectedMode === 'memoire' || selectedMode === 'chaos';
  const isBlind = selectedMode === 'blind' || selectedMode === 'chaos';
  const isSudden = selectedMode === 'sudden';
  const endedRef = useRef(false);
  const [modifiedWord, setModifiedWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [fallingWords, setFallingWords] = useState<{ id: number; text: string; left: number; rot: number }[]>([]);
  const fallIdRef = useRef(0);
  const [showEffect, setShowEffect] = useState(false);
  const [effectType, setEffectType] = useState<'epic' | 'great' | 'good' | ''>('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastWordTime, setLastWordTime] = useState(Date.now());
  const [screenShake, setScreenShake] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [showFloatingScore, setShowFloatingScore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showWord, setShowWord] = useState(true);
  const [wasLeet, setWasLeet] = useState(false);
  const [wasReversed, setWasReversed] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [memoryDisplayTime, setMemoryDisplayTime] = useState(1.5);
  const [wordVisibleTimeLeft, setWordVisibleTimeLeft] = useState(0);


  useEffect(() => {
    generateNewWord();
    inputRef.current?.focus();

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Termine la partie (fin du temps OU mort subite) avec les stats courantes.
  const finishGame = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    const accuracy = attempts > 0 ? Math.round((wordsCompleted / attempts) * 100) : (wordsCompleted > 0 ? 100 : 0);
    onGameEnd({
      mode: selectedMode,
      score,
      wordCount: wordsCompleted,
      accuracy,
      wpm: computeWpm(correctChars, GAME_DURATION),
      maxCombo,
      durationSec: GAME_DURATION,
    });
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  useEffect(() => {
    if (timeLeft === 0) finishGame();
  }, [timeLeft]);

  const generateNewWord = () => {
    const word = getRandomWord(selectedMode);
    const includeNumbers = selectedMode === 'leet' || selectedMode === 'chaos';
    const reverseWords = selectedMode === 'inversé' || selectedMode === 'chaos';
    const { modified, isLeet, isReversed } = modifyWord(word, includeNumbers, reverseWords);

    setModifiedWord(modified);
    setUserInput('');
    setLastWordTime(Date.now());
    setWasLeet(isLeet);
    setWasReversed(isReversed);

    if (isMemory) {
      setShowWord(true);
      setWordVisibleTimeLeft(memoryDisplayTime); // initialise le temps visible
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowWord(false);
      }, memoryDisplayTime * 1000);
    } else {
      setShowWord(true);
    }
  };

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const validateInput = () => {
    const cleanedInput = userInput.trim().toLowerCase();
    const cleanedTarget = modifiedWord.toLowerCase();

    if (cleanedInput === cleanedTarget) {
      const currentTime = Date.now();
      const timeTaken = (currentTime - lastWordTime) / 1000;
      const newComboCount = comboCount + 1;
      setComboCount(newComboCount);
      setMaxCombo(prev => Math.max(prev, newComboCount));

      // Fait tomber le mot validé (effet gravité).
      const fid = fallIdRef.current++;
      const droppedWord = modifiedWord;
      const left = 30 + Math.random() * 40; // 30%–70%
      const rot = (Math.random() - 0.5) * 80; // -40°–40°
      setFallingWords(prev => [...prev, { id: fid, text: droppedWord, left, rot }]);
      setTimeout(() => {
        setFallingWords(prev => prev.filter(w => w.id !== fid));
      }, 1500);

      let wordScore = calculateScore(modifiedWord.length, timeTaken, newComboCount, wasLeet, wasReversed);
      // Mode Leet : +10% de points (mode plus exigeant).
      if (selectedMode === 'leet') wordScore = Math.round(wordScore * 1.1);
      setScore(prev => prev + wordScore);
      setLastScore(wordScore);
      setWordsCompleted(prev => prev + 1);
      setCorrectChars(prev => prev + modifiedWord.length);
      setAttempts(prev => prev + 1);

      // ✅ Réduction du temps d'affichage si mode mémoire/chaos
      if (isMemory) {
        setMemoryDisplayTime(prev => Math.max(0.5, prev - 0.1));
      }

      if (newComboCount >= 5) {
        setEffectType('epic');
        setShowEffect(true);
        triggerScreenShake();
      } else if (newComboCount >= 3) {
        setEffectType('great');
        setShowEffect(true);
      } else if (newComboCount >= 1) {
        setEffectType('good');
        setShowEffect(true);
      }

      setShowFloatingScore(true);
      setTimeout(() => setShowFloatingScore(false), 1000);
      setTimeout(() => setShowEffect(false), 1000);
      generateNewWord();
    } else {
      // ☠️ Mort subite : la moindre faute termine la partie.
      if (isSudden) {
        finishGame();
        return;
      }

      setComboCount(0);
      setAttempts(prev => prev + 1);
      setUserInput('');

      // ❌ Reset du timer si on se trompe en mode mémoire/chaos
      if (isMemory) {
        setMemoryDisplayTime(1.5);
      }

      generateNewWord();
    }
  };

  useEffect(() => {
    if (isMemory && showWord) {
      const interval = setInterval(() => {
        setWordVisibleTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [selectedMode, showWord]);

  useEffect(() => {
    const cleanedInput = userInput.trim().toLowerCase();
    const cleanedTarget = modifiedWord.toLowerCase();

    // Mort subite : dès qu'un caractère tapé ne correspond plus, c'est fini.
    if (isSudden && cleanedInput.length > 0 && !cleanedTarget.startsWith(cleanedInput)) {
      finishGame();
      return;
    }

    if (cleanedInput === cleanedTarget || userInput.length > modifiedWord.length) {
      validateInput();
    }
  }, [userInput]);


  return (
    <>
    {/* Mots validés qui tombent (effet gravité) */}
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {fallingWords.map(w => (
        <span
          key={w.id}
          className={`absolute top-[38%] -translate-x-1/2 text-2xl font-bold animate-fall whitespace-nowrap ${hardcore ? 'text-red-300' : 'text-purple-300'}`}
          style={{ left: `${w.left}%`, ['--fall-rot' as any]: `${w.rot}deg` }}
        >
          {w.text}
        </span>
      ))}
    </div>

    <div className="max-w-2xl w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="text-xl font-bold">
          {t('score')}: <span className={`animate-pulse ${hardcore ? 'text-red-400' : 'text-purple-400'}`}>{score}</span>
        </div>
        <div className="text-xl font-bold">
          {t('time')}:{' '}
          <span className={`${timeLeft <= 10 ? 'text-red-500' : 'text-green-400'}`}>
            {timeLeft}s
          </span>
        </div>
        <button
          onClick={onStop}
          className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          {t('quit')}
        </button>
      </div>

      <div className={`
        bg-gray-800 p-6 rounded-lg shadow-lg relative overflow-hidden select-none
        transition-transform duration-50
        ${hardcore ? 'ring-1 ring-red-500/40' : ''}
        ${screenShake ? 'animate-shake' : ''}
      `}>
        {showEffect && effectType !== '' && (
          <>
            <ParticleEffect type={effectType} />
            <div className={`
              absolute inset-0 flex items-center justify-center pointer-events-none z-10
              animate-combo-popup
              ${effectType === 'epic' ? 'text-pink-500 text-6xl font-bold'
                : effectType === 'great' ? 'text-purple-500 text-5xl font-bold'
                  : 'text-blue-400 text-4xl'}
            `}>
              {effectType === 'epic' ? 'EPIC COMBO!' : effectType === 'great' ? 'Great Combo!' : 'Good!'}
            </div>
          </>
        )}

        {showFloatingScore && effectType !== '' && (
          <FloatingScore score={lastScore} type={effectType} />
        )}

        <div className={`
          transition-all duration-300
          ${showEffect ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
        `}>
          <div className="mb-8 text-center">
            <div className="text-sm text-gray-400 mb-2">{t('typeThisWord')}</div>
            {showWord ? (
              <WordDisplay word={modifiedWord} />
            ) : (
              <div className="text-2xl font-bold text-gray-500">???</div>
            )}
          </div>

          {isMemory && showWord && (
            <div className="w-full bg-gray-700 h-2 rounded overflow-hidden mt-4">
              <div
                className={`h-full transition-all duration-100 ${hardcore ? 'bg-red-500' : 'bg-purple-500'}`}
                style={{ width: `${(wordVisibleTimeLeft / memoryDisplayTime) * 100}%` }}
              />
            </div>
          )}


          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                validateInput();
              }
              // Anti-triche : pas de "tout sélectionner" (révélerait le texte transparent).
              if (isBlind && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
              }
            }}
            // Anti-triche : pas de copier/coller/glisser-déposer dans le champ.
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`w-full bg-gray-700 text-center text-2xl py-4 px-6 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-gray-600 ${hardcore ? 'focus:ring-red-500' : 'focus:ring-purple-500'} ${isBlind ? 'blind-input text-transparent caret-white' : 'text-white'
              }`}
          />

          <div className="mt-6 flex justify-between text-sm">
            <div>
              {t('words')}: <span className="text-green-400">{wordsCompleted}</span>
            </div>
            <div>
              {t('combo')}:{' '}
              <span className={`
                ${comboCount >= 5 ? 'text-pink-400 animate-pulse font-bold'
                  : comboCount >= 3 ? 'text-purple-400 animate-pulse'
                    : 'text-gray-400'}
              `}>
                {comboCount}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default GameScreen;
