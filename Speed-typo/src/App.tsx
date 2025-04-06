import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
export function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, result
  const [finalScore, setFinalScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const startGame = () => {
    setGameState('playing');
  };
  const endGame = (score, totalWords, accuracyRate) => {
    setFinalScore(score);
    setWordCount(totalWords);
    setAccuracy(accuracyRate);
    setGameState('result');
  };
  const restartGame = () => {
    setGameState('start');
  };
  return <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {gameState === 'start' && <StartScreen onStart={startGame} />}
      {gameState === 'playing' && <GameScreen onGameEnd={endGame} />}
      {gameState === 'result' && <ResultScreen score={finalScore} wordCount={wordCount} accuracy={accuracy} onRestart={restartGame} />}
    </div>;
}