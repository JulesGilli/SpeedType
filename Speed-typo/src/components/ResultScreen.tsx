interface ResultScreenProps {
  score: number;
  wordCount: number;
  accuracy: number;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, wordCount, accuracy, onRestart }) => {
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
        <p className="text-xl mb-8">{getMessage()}</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Words Completed</div>
            <div className="text-2xl font-bold text-green-400">{wordCount}</div>
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
