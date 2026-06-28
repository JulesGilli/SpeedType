import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;      // ms par caractère
  startDelay?: number; // ms avant de commencer
  className?: string;
  caret?: boolean;
}

// Révèle un texte caractère par caractère (effet machine à écrire).
const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 26,
  startDelay = 0,
  className,
  caret = true,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const startT = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(startT);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  const finished = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      {caret && !finished && <span className="opacity-60 animate-pulse">|</span>}
    </span>
  );
};

export default Typewriter;
