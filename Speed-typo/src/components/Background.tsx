import Dither from './Dither';

interface BackgroundProps {
  enabled: boolean;
}

// Fond accordé à la palette de l'UI (violet -> rose).
// `enabled=false` : on n'affiche que le dégradé statique (aucun rendu GPU/canvas).
const Background: React.FC<BackgroundProps> = ({ enabled }) => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    {enabled && (
      <Dither
        waveColor={[0.45, 0.18, 0.78]}
        disableAnimation={false}
        enableMouseInteraction={false}
        colorNum={4}
        waveAmplitude={0.28}
        waveFrequency={2.5}
        waveSpeed={0.028}
        pixelSize={2}
      />
    )}

    {/* Harmonisation : voile sombre + lueurs violet/rose de la DA.
        Quand le fond animé est coupé, ce dégradé sert de fond statique. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(120% 80% at 15% 8%, rgba(168,85,247,0.20), transparent 55%),' +
          'radial-gradient(120% 90% at 85% 92%, rgba(236,72,153,0.18), transparent 55%),' +
          `linear-gradient(180deg, rgba(15,15,23,${enabled ? 0.7 : 0.96}), rgba(15,15,23,${enabled ? 0.84 : 0.99}))`,
      }}
    />

    <div
      className="absolute inset-0"
      style={{ boxShadow: 'inset 0 0 220px 70px rgba(0,0,0,0.55)' }}
    />
  </div>
);

export default Background;
