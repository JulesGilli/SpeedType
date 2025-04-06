import React from 'react';
const StartScreen = ({
  onStart
}) => {
  return <div className="max-w-md w-full text-center">
      <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Speed Typo
      </h1>
      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">How to Play</h2>
        <ul className="text-left space-y-2 mb-6">
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Type the words as they appear on screen</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>
              Some words will have numbers instead of letters (E→3, A→4)
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Some words will be reversed</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Type quickly to build combos for bonus points!</span>
          </li>
        </ul>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Examples:</p>
          <div className="flex justify-center space-x-4">
            <div className="bg-gray-700 px-3 py-1 rounded">h3llo</div>
            <div className="bg-gray-700 px-3 py-1 rounded">c4t</div>
            <div className="bg-gray-700 px-3 py-1 rounded">dlrow</div>
          </div>
        </div>
      </div>
      <button onClick={onStart} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-lg font-bold hover:from-purple-600 hover:to-pink-600 transform transition-all hover:scale-105 shadow-lg">
        Start Game
      </button>
    </div>;
};
export default StartScreen;