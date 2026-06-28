import { GameResult } from '../types/GameResult';
import { SaveStatus } from '../App';

interface ResultScreenProps {
  result: GameResult;
  saveStatus: SaveStatus;
  onRestart: () => void;
}

const SaveStatusLine: React.FC<{ status: SaveStatus }> = ({ status }) => {
  const map: Record<SaveStatus, { text: string; className: string } | null> = {
    idle: null,
    saving: { text: '⏳ Enregistrement du score…', className: 'text-gray-400' },
    saved: { text: '✅ Score enregistré dans le classement', className: 'text-green-400' },
    error: { text: '⚠️ Échec de l’enregistrement du score', className: 'text-red-400' },
    anon: { text: '🔒 Connecte-toi pour apparaître au classement', className: 'text-yellow-400' },
  };
  const entry = map[status];
  if (!entry) return null;
  return <p className={`text-sm mb-4 ${entry.className}`}>{entry.text}</p>;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ result, saveStatus, onRestart }) => {
  const { score, wordCount, accuracy, wpm } = result;

  const getMessage = () => {
    if (score >= 500 && accuracy >= 90) {
      return 'Incredible! Your typing skills are legendary!';
    } else if (score >= 300 && accuracy >= 80) {
      return "Amazing job! You're a typing master!";
    } else if (score >= 200 && accuracy >= 70) {
      return 'Great work! Your typing skills are impressive!';
    } else if (score >= 100) {
      return 'Good effort! Keep practicing to improve!';
    } else {
      return "Nice try! With more practice, you'll get better!";
    }
  };

  return (
    <div className="max-w-md w-full text-center">
      <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Game Over!
      </h1>
      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
        <div className="text-5xl font-bold mb-6">
          {score}
          <span className="text-sm text-gray-400 ml-2">points</span>
        </div>
        <p className="text-xl mb-4">{getMessage()}</p>
        <SaveStatusLine status={saveStatus} />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Words</div>
            <div className="text-2xl font-bold text-green-400">{wordCount}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">WPM</div>
            <div className="text-2xl font-bold text-purple-400">{wpm}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Accuracy</div>
            <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
          </div>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-lg font-bold hover:from-purple-600 hover:to-pink-600 transform transition-all hover:scale-105 shadow-lg"
      >
        Play Again
      </button>
    </div>
  );
};

export default ResultScreen;
