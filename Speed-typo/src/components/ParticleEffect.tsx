import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  angle: number;
  delay: number;
}

interface ParticleEffectProps {
  type: 'epic' | 'great' | 'good';
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ type }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = type === 'epic' ? 50 : type === 'great' ? 30 : 15;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (360 / particleCount) * i,
      delay: i * 50,
    }));
    setParticles(newParticles);
  }, [type]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`
            absolute left-1/2 top-1/2 w-2 h-2 rounded-full
            ${type === 'epic' ? 'bg-pink-500' : type === 'great' ? 'bg-purple-500' : 'bg-blue-400'}
          `}
          style={{
            transform: `rotate(${particle.angle}deg)`,
            animation: `
              particle-fly-out 0.5s ease-out ${particle.delay}ms forwards,
              particle-fade 0.5s ease-out ${particle.delay}ms forwards
            `,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
