import React from 'react';
const FloatingScore = ({
  score,
  type
}) => {
  return <div className={`
        absolute left-1/2 -translate-x-1/2 pointer-events-none
        font-bold text-center whitespace-nowrap
        animate-float-up
        ${type === 'epic' ? 'text-pink-500 text-4xl' : type === 'great' ? 'text-purple-500 text-3xl' : 'text-blue-400 text-2xl'}
      `}>
      +{score}
    </div>;
};
export default FloatingScore;