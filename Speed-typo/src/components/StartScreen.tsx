import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  includeNumbers: boolean;
  reverseWords: boolean;
  setIncludeNumbers: (value: boolean) => void;
  setReverseWords: (value: boolean) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  includeNumbers,
  reverseWords,
  setIncludeNumbers,
  setReverseWords,
}) => {
  return (
    <div className="max-w-md w-full text-center">
      <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Speed Typo
      </h1>
      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Comment jouer</h2>
        <ul className="text-left space-y-2 mb-6">
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Tape les mots qui s’affichent à l’écran</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Certains mots auront des chiffres à la place des lettres (E→3, A→4)</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Certains mots seront à l’envers</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Tape vite pour enchaîner les combos et gagner plus de points !</span>
          </li>
        </ul>

        <div className="mb-6 space-y-4 text-left">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="form-checkbox h-5 w-5 text-purple-500 focus:ring-pink-500 rounded"
            />
            <span>Inclure les chiffres dans les mots (ex: h3llo)</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={reverseWords}
              onChange={(e) => setReverseWords(e.target.checked)}
              className="form-checkbox h-5 w-5 text-purple-500 focus:ring-pink-500 rounded"
            />
            <span>Inverser certains mots (ex: dlrow)</span>
          </label>
        </div>


        <button
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-lg font-bold hover:from-purple-600 hover:to-pink-600 transform transition-all hover:scale-105 shadow-lg"
        >
          Commencer
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
