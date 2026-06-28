import Dither from './Dither';

// Fond animé Dither en plein écran, derrière tout le contenu.
// pointer-events-none : ne capte jamais les clics de l'UI.
const Background: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <Dither
      waveColor={[0.486, 0.227, 0.929]}
      disableAnimation={false}
      enableMouseInteraction={false}
      colorNum={4}
      waveAmplitude={0.3}
      waveFrequency={3}
      waveSpeed={0.04}
      pixelSize={2}
    />
    {/* Voile sombre pour garder le contenu lisible par-dessus le fond. */}
    <div className="absolute inset-0 bg-gray-900/60" />
  </div>
);

export default Background;
