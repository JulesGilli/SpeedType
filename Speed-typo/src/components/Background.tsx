import Dither from './Dither';

// Fond animé Dither, accordé à la palette de l'UI (violet -> rose).
// pointer-events-none : ne capte jamais les clics de l'UI.
const Background: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <Dither
      waveColor={[0.45, 0.18, 0.78]} // violet profond, base de la DA
      disableAnimation={false}
      enableMouseInteraction={false}
      colorNum={4}
      waveAmplitude={0.28}
      waveFrequency={2.5}
      waveSpeed={0.028}
      pixelSize={2}
    />

    {/* Harmonisation : voile sombre + lueurs violet/rose de la DA. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(120% 80% at 15% 8%, rgba(168,85,247,0.20), transparent 55%),' +
          'radial-gradient(120% 90% at 85% 92%, rgba(236,72,153,0.18), transparent 55%),' +
          'linear-gradient(180deg, rgba(15,15,23,0.70), rgba(15,15,23,0.84))',
      }}
    />

    {/* Vignette pour concentrer le regard sur le centre. */}
    <div
      className="absolute inset-0"
      style={{ boxShadow: 'inset 0 0 220px 70px rgba(0,0,0,0.55)' }}
    />
  </div>
);

export default Background;
