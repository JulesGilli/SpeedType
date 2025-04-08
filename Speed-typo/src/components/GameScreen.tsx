import React, { useEffect, useState, useRef } from 'react';
import WordDisplay from './WordDisplay';
import ParticleEffect from './ParticleEffect';
import FloatingScore from './FloatingScore';
import { getRandomWord, modifyWord, calculateScore } from '../utils/gameUtils';
import { GameMode } from '../types/GameMode';
import EndlessPhraseGame from './EndlessPhraseGame';

const GAME_DURATION = 60;

interface GameScreenProps {
  onGameEnd: (score: number, totalWords: number, accuracy: number) => void;
  selectedMode: GameMode;
  onStop: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd, selectedMode, onStop }) => {
  if (selectedMode === 'endless') {
    return <EndlessPhraseGame onGameEnd={onGameEnd} onStop={onStop} />;
  }

  const [currentWord, setCurrentWord] = useState('');
  const [modifiedWord, setModifiedWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [comboCount, setComboCount] = useState(0);
  const [showEffect, setShowEffect] = useState(false);
  const [effectType, setEffectType] = useState<'epic' | 'great' | 'good' | ''>('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
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

  useEffect(() => {
    if (timeLeft === 0) {
      const accuracy = attempts > 0 ? Math.round((wordsCompleted / attempts) * 100) : 0;
      onGameEnd(score, wordsCompleted, accuracy);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  }, [timeLeft]);

  const generateNewWord = () => {
    const word = getRandomWord();
    const includeNumbers = selectedMode === 'leet';
    const reverseWords = selectedMode === 'inversé';
    const { modified, originalWord, isLeet, isReversed } = modifyWord(word, includeNumbers, reverseWords);

    setCurrentWord(originalWord);
    setModifiedWord(modified);
    setUserInput('');
    setLastWordTime(Date.now());
    setWasLeet(isLeet);
    setWasReversed(isReversed);

    if (selectedMode === 'memoire') {
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

      const wordScore = calculateScore(modifiedWord.length, timeTaken, newComboCount, wasLeet, wasReversed);
      setScore(prev => prev + wordScore);
      setLastScore(wordScore);
      setWordsCompleted(prev => prev + 1);
      setAttempts(prev => prev + 1);

      // ✅ Réduction du temps d'affichage si mode mémoire
      if (selectedMode === 'memoire') {
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
      setComboCount(0);
      setAttempts(prev => prev + 1);
      setUserInput('');

      // ❌ Reset du timer si on se trompe en mode mémoire
      if (selectedMode === 'memoire') {
        setMemoryDisplayTime(1.5);
      }

      generateNewWord();
    }
  };

  useEffect(() => {
    if (selectedMode === 'memoire' && showWord) {
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

    if (cleanedInput === cleanedTarget || userInput.length > modifiedWord.length) {
      validateInput();
    }
  }, [userInput]);


  return (
    <div className="max-w-2xl w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="text-xl font-bold">
          Score: <span className="text-purple-400 animate-pulse">{score}</span>
        </div>
        <div className="text-xl font-bold">
          Time:{' '}
          <span className={`${timeLeft <= 10 ? 'text-red-500' : 'text-green-400'}`}>
            {timeLeft}s
          </span>
        </div>
        <button
          onClick={onStop}
          className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Quitter
        </button>
      </div>

      <div className={`
        bg-gray-800 p-6 rounded-lg shadow-lg relative overflow-hidden
        transition-transform duration-50
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
            <div className="text-sm text-gray-400 mb-2">Type this word:</div>
            {showWord ? (
              <WordDisplay word={modifiedWord} />
            ) : (
              <div className="text-2xl font-bold text-gray-500">???</div>
            )}
          </div>

          {selectedMode === 'memoire' && showWord && (
            <div className="w-full bg-gray-700 h-2 rounded overflow-hidden mt-4">
              <div
                className="bg-purple-500 h-full transition-all duration-100"
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
            }}
            className={`w-full bg-gray-700 text-center text-2xl py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:bg-gray-600 ${selectedMode === 'blind' ? 'text-transparent caret-white' : 'text-white'
              }`}
          />

          <div className="mt-6 flex justify-between text-sm">
            <div>
              Words: <span className="text-green-400">{wordsCompleted}</span>
            </div>
            <div>
              Combo:{' '}
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
  );
};

export default GameScreen;
