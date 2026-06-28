import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';

const TARGET = 'SpeedType';

interface IntroGateProps {
  onUnlock: () => void;
}

// Écran d'intro : l'utilisateur doit taper "SpeedType" pour déverrouiller l'UI.
const IntroGate: React.FC<IntroGateProps> = ({ onUnlock }) => {
  const { t } = useI18n();
  const [typed, setTyped] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const typedRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      setTimeout(onUnlock, 650); // laisse jouer l'animation de sortie
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (doneRef.current) return;

      // Entrée = passer l'intro.
      if (e.key === 'Enter') {
        setTyped(TARGET.length);
        finish();
        return;
      }
      if (e.key === 'Backspace') {
        typedRef.current = Math.max(0, typedRef.current - 1);
        setTyped(typedRef.current);
        return;
      }
      if (e.key.length !== 1) return;

      const expected = TARGET[typedRef.current];
      if (e.key.toLowerCase() === expected.toLowerCase()) {
        typedRef.current += 1;
        setTyped(typedRef.current);
        if (typedRef.current >= TARGET.length) finish();
      } else {
        setWrong(true);
        setTimeout(() => setWrong(false), 160);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUnlock]);

  return (
    <motion.div
      key="intro"
      className="relative z-20 w-full min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <motion.div
        className={`flex text-6xl sm:text-7xl font-extrabold tracking-tight ${wrong ? 'animate-shake' : ''}`}
        animate={done ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        {TARGET.split('').map((ch, i) => {
          const isTyped = i < typed;
          const isCurrent = i === typed && !done;
          return (
            <span
              key={i}
              className={`relative transition-colors duration-150 ${
                isTyped
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500'
                  : 'text-white/15'
              }`}
              style={
                isTyped
                  ? { textShadow: '0 0 22px rgba(192,82,243,0.5)' }
                  : undefined
              }
            >
              {ch}
              {isCurrent && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-pink-400 animate-pulse" />
              )}
            </span>
          );
        })}
      </motion.div>

      <motion.p
        className="mt-10 text-sm text-gray-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: done ? 0 : 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {t('introType')} <span className="text-gray-200 font-semibold">SpeedType</span> {t('introEnter')}
        <span className="text-gray-600"> · {t('introSkip')}</span>
      </motion.p>
    </motion.div>
  );
};

export default IntroGate;
