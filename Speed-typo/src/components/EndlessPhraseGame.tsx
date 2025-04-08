import React, { useEffect, useState } from 'react';

interface EndlessPhraseGameProps {
    onGameEnd: (score: number, totalWords: number, accuracy: number) => void;
    onStop: () => void;
}

const generateText = () => {
    const words = [
        'soleil', 'galaxie', 'astronaute', 'lumière', 'orbite', 'fusion',
        'étoile', 'comète', 'constellation', 'téléportation',
        'univers', 'gravité', 'cosmos', 'satellite', 'matière',
        'dimension', 'trou', 'noir', 'collision', 'vitesse', 'quasar'
    ];
    return Array(1000)
        .fill(0)
        .map(() => words[Math.floor(Math.random() * words.length)])
        .join(' ');
};

const EndlessPhraseGame: React.FC<EndlessPhraseGameProps> = ({ onGameEnd, onStop }) => {
    const [phrase, setPhrase] = useState('');
    const [index, setIndex] = useState(0);
    const [shake, setShake] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        setPhrase(generateText());
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            if (key.length === 1) {
                if (key === phrase[index]) {
                    setIndex(prev => prev + 1);
                } else {
                    setIndex(prev => Math.max(0, prev - 1));
                    setShake(true);
                    setTimeout(() => setShake(false), 200);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phrase, index]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            const meters = index / 100;
            const avgWordLength = 5;
            const wordsTyped = Math.floor(index / avgWordLength);
            const accuracy = 100;

            onGameEnd(meters, wordsTyped, accuracy);
        }
    }, [timeLeft]);

    const current = phrase.substring(index, index + 30);
    const before = phrase.substring(Math.max(0, index - 15), index);

    return (
        <div className="max-w-2xl w-full">
            {/* Bandeau haut */}
            <div className="flex justify-between items-center mb-8">
                <div className="text-xl font-bold">
                    Distance : <span className="text-purple-400 animate-pulse">{(index / 100).toFixed(2)} m</span>
                </div>
                <div className="text-xl font-bold">
                    Temps : <span className={`${timeLeft <= 10 ? 'text-red-500' : 'text-green-400'}`}>{timeLeft}s</span>
                </div>
                <button
                    onClick={onStop}
                    className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Quitter
                </button>
            </div>

            {/* Cadre principal */}
            <div
                className={`bg-gray-800 p-6 rounded-lg shadow-lg relative overflow-hidden ${shake ? 'animate-shake' : ''
                    }`}
            >
                <div className="flex pointer-events-none text-xl font-mono">
                    <div className="text-gray-600 whitespace-nowrap">{before}</div>
                    <span
                        className="text-purple-300 relative -top-1"
                        style={{ fontWeight: 'bold' }}
                    >
                        {phrase[index] || ''}
                    </span>
                    <div
                        className="whitespace-nowrap ml-1"
                        style={{
                            background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        {current.substring(1)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndlessPhraseGame;
