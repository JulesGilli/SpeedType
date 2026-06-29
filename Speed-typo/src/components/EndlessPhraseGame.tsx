import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameResult } from '../types/GameResult';
import { computeWpm } from '../utils/gameUtils';
import { useI18n, ENDLESS_PHRASES } from '../lib/i18n';

interface EndlessPhraseGameProps {
    onGameEnd: (result: GameResult) => void;
    onStop: () => void;
}

const GAME_DURATION = 60;

// Construit un long flux de texte en piochant des phrases (de la langue) au hasard.
const buildStream = (phrases: string[]): string => {
    let text = '';
    while (text.length < 2200) {
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        text += (text ? ' ' : '') + phrase;
    }
    return text;
};

const EndlessPhraseGame: React.FC<EndlessPhraseGameProps> = ({ onGameEnd, onStop }) => {
    const { t, lang } = useI18n();
    const phrase = useMemo(() => buildStream(ENDLESS_PHRASES[lang] ?? ENDLESS_PHRASES.en), [lang]);
    const [index, setIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [wrong, setWrong] = useState(false);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const indexRef = useRef(0);
    const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Frappe : on avance sur la bonne lettre, on signale l'erreur sinon.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.length !== 1) return; // ignore Shift, Alt, fleches, etc.
            if (e.key === ' ') e.preventDefault(); // pas de scroll de page
            const expected = phrase[indexRef.current];
            if (e.key === expected) {
                indexRef.current += 1;
                setIndex(indexRef.current);
            } else {
                setErrors(prev => prev + 1);
                setWrong(true);
                if (wrongTimer.current) clearTimeout(wrongTimer.current);
                wrongTimer.current = setTimeout(() => setWrong(false), 150);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phrase]);

    // Chrono.
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            const correct = indexRef.current;
            const total = correct + errors;
            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
            onGameEnd({
                mode: 'endless',
                score: correct, // points = caractères corrects (≈ ancienne distance ×10)
                wordCount: Math.floor(correct / 5),
                accuracy,
                wpm: computeWpm(correct, GAME_DURATION),
                maxCombo: 0,
                durationSec: GAME_DURATION,
            });
        }
    }, [timeLeft]);

    // Stats live.
    const elapsed = GAME_DURATION - timeLeft;
    const liveWpm = elapsed > 0 ? computeWpm(index, elapsed) : 0;
    const total = index + errors;
    const liveAccuracy = total > 0 ? Math.round((index / total) * 100) : 100;
    const wpmGauge = Math.min(100, (liveWpm / 130) * 100);

    // Fenêtre de texte affichée autour du curseur (perf + effet de défilement).
    const windowStart = Math.max(0, index - 30);
    const slice = phrase.slice(windowStart, windowStart + 240);

    return (
        <div className="max-w-2xl w-full">
            {/* Bandeau haut */}
            <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-bold">
                    {t('score')} : <span className="text-purple-400">{index}</span>
                </div>
                <div className="text-xl font-bold">
                    {t('time')} :{' '}
                    <span className={timeLeft <= 10 ? 'text-red-500' : 'text-green-400'}>{timeLeft}s</span>
                </div>
                <button
                    onClick={onStop}
                    className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    {t('quit')}
                </button>
            </div>

            {/* Stats live : WPM + précision */}
            <div className="flex items-center gap-4 mb-4">
                <div className="text-sm text-gray-300">
                    {t('wpm')} <span className="text-pink-400 font-bold text-base">{liveWpm}</span>
                </div>
                <div className="flex-1 h-2 bg-gray-700/70 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${wpmGauge}%` }}
                    />
                </div>
                <div className="text-sm text-gray-300">
                    {t('accuracy')} <span className="text-green-400 font-bold text-base">{liveAccuracy}%</span>
                </div>
            </div>

            {/* Zone de frappe */}
            <div
                className={`relative rounded-2xl p-6 bg-gray-800/80 backdrop-blur-sm border transition-colors
                    ${wrong ? 'border-red-500/70 animate-shake' : 'border-purple-500/40'}
                `}
                style={{
                    boxShadow: wrong
                        ? '0 0 30px rgba(239,68,68,0.25)'
                        : '0 0 40px rgba(168,85,247,0.20)',
                }}
            >
                <div
                    className="font-mono text-2xl leading-relaxed tracking-wide select-none break-words"
                    style={{
                        maskImage: 'linear-gradient(180deg, transparent, #000 12%, #000 80%, transparent)',
                        WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 12%, #000 80%, transparent)',
                        height: '8.5rem',
                        overflow: 'hidden',
                    }}
                >
                    {slice.split('').map((ch, i) => {
                        const pos = windowStart + i;
                        const isCurrent = pos === index;
                        const isTyped = pos < index;
                        return (
                            <span
                                key={pos}
                                className={
                                    isCurrent
                                        ? `rounded-sm ${wrong ? 'bg-red-500/40 text-white' : 'bg-pink-500/30 text-white border-l-2 border-pink-400'}`
                                        : isTyped
                                            ? 'text-gray-100'
                                            : 'text-gray-600'
                                }
                            >
                                {ch === ' ' ? ' ' : ch}
                            </span>
                        );
                    })}
                </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
                {t('endlessHint')}
            </p>
        </div>
    );
};

export default EndlessPhraseGame;
