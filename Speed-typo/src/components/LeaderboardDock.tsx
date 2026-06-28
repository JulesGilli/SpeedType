import { useState } from 'react';
import LeaderboardContent from './LeaderboardContent';

// Dock "Classement" toujours présent sur l'accueil : une barre cliquable
// ancrée en bas à droite qui déplie le classement vers le haut.
const LeaderboardDock: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-96">
      <div className="flex flex-col rounded-t-xl sm:rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Contenu : visible au-dessus de la barre quand déplié */}
        <div
          className={`bg-gray-800 overflow-y-auto nice-scroll transition-all duration-300 ease-out
            ${open ? 'max-h-[65vh] p-4' : 'max-h-0 p-0'}
          `}
        >
          <LeaderboardContent />
        </div>

        {/* Barre cliquable */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-3 flex items-center justify-between text-white font-semibold transition-colors"
        >
          <span>Classement</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LeaderboardDock;
