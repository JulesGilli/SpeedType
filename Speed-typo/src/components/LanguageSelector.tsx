import { useI18n, LANGS } from '../lib/i18n';

// Sélecteur de langue (drapeaux), toujours visible sur l'accueil.
const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useI18n();
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-800/70 backdrop-blur-md border border-white/10">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.label}
          aria-label={l.label}
          className={`px-1.5 py-0.5 rounded text-lg leading-none transition-all ${
            lang === l.code ? 'opacity-100 scale-110' : 'opacity-45 hover:opacity-90'
          }`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
