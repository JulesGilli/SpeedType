interface SegmentedOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

// Petit contrôle segmenté (pilule) : l'option active prend le dégradé de la DA.
function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-gray-800/60 border border-white/10 backdrop-blur-sm">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
            value === o.key
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default Segmented;
