interface WordDisplayProps {
  word: string;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word }) => {
  return (
    <div className="text-4xl font-mono font-bold tracking-wider bg-gray-700 py-3 px-6 rounded-lg inline-block">
      {word}
    </div>
  );
};

export default WordDisplay;
