interface BackgroundToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

// Petit interrupteur (toujours visible sur l'accueil) pour couper le fond animé
// si la machine rame.
const BackgroundToggle: React.FC<BackgroundToggleProps> = ({ enabled, onToggle }) => (
  <button
    onClick={() => onToggle(!enabled)}
    title="Active ou coupe le fond animé"
    className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold
      bg-gray-800/70 backdrop-blur-md border border-white/10 text-gray-200 hover:bg-gray-700/70 transition-colors"
  >
    <span>Fond animé</span>
    <span
      className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'left-[1.15rem]' : 'left-0.5'}`}
      />
    </span>
  </button>
);

export default BackgroundToggle;
