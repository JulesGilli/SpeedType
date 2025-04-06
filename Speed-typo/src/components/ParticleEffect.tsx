import React, { useEffect, useState } from 'react';
const ParticleEffect = ({
  type
}) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const particleCount = type === 'epic' ? 50 : type === 'great' ? 30 : 15;
    const newParticles = Array.from({
      length: particleCount
    }, (_, i) => ({
      id: i,
      angle: 360 / particleCount * i,
      delay: i * 50
    }));
    setParticles(newParticles);
  }, [type]);
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => <div key={particle.id} className={`
            absolute left-1/2 top-1/2 w-2 h-2 rounded-full
            ${type === 'epic' ? 'bg-pink-500' : type === 'great' ? 'bg-purple-500' : 'bg-blue-400'}
          `} style={{
      transform: `rotate(${particle.angle}deg)`,
      animation: `
              particle-fly-out 0.5s ease-out ${particle.delay}ms forwards,
              particle-fade 0.5s ease-out ${particle.delay}ms forwards
            `
    }} />)}
    </div>;
};
export default ParticleEffect;