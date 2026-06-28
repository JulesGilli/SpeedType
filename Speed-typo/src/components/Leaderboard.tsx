import { useEffect, useState } from 'react';
import GameModeSelector from './GameModeSelector';
import { GameMode } from '../types/GameMode';
import { useAuth } from '../lib/AuthContext';
import {
  fetchLeaderboard,
  LeaderboardPeriod,
  LeaderboardRow,
} from '../lib/leaderboard';

interface LeaderboardProps {
  onBack: () => void;
}

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
  { key: 'all', label: 'Tout temps' },
];

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const { user, configured } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [mode, setMode] = useState<GameMode>('classique');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(period, mode).then((data) => {
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [period, mode, configured]);

  const formatScore = (value: number) =>
    mode === 'endless' ? `${value} m` : `${value} pts`;

  return (
    <div className="max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Classement
        </h1>
        <button
          onClick={onBack}
          className="text-sm px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Retour
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow
              ${period === p.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Sélecteur de mode (réutilise le composant existant) */}
      <GameModeSelector selectedMode={mode} onSelectMode={setMode} />

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-4">
        {/* En-tête de tableau */}
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 px-4 py-3 text-xs text-gray-400 border-b border-gray-700">
          <div>#</div>
          <div>Joueur</div>
          <div className="text-right">Score</div>
          <div className="text-right">WPM</div>
        </div>

        {!configured ? (
          <div className="px-4 py-10 text-center text-gray-400">
            Le classement nécessite la connexion au serveur.
          </div>
        ) : loading ? (
          <div className="px-4 py-10 text-center text-gray-400">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400">
            Aucun score sur cette période. Sois le premier !
          </div>
        ) : (
          rows.map((row, index) => {
            const isMe = user?.id === row.user_id;
            const rankColor =
              index === 0
                ? 'text-yellow-400'
                : index === 1
                  ? 'text-gray-300'
                  : index === 2
                    ? 'text-amber-600'
                    : 'text-gray-500';
            return (
              <div
                key={row.user_id}
                className={`grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 px-4 py-3 items-center border-b border-gray-700/50 last:border-0
                  ${isMe ? 'bg-purple-500/10' : ''}
                `}
              >
                <div className={`font-bold ${rankColor}`}>{index + 1}</div>
                <div className="truncate">
                  <span className={isMe ? 'text-purple-300 font-semibold' : 'text-white'}>
                    {row.username}
                  </span>
                  {isMe && <span className="text-xs text-purple-400 ml-2">(toi)</span>}
                </div>
                <div className="text-right font-semibold text-green-400">
                  {formatScore(row.best_score)}
                </div>
                <div className="text-right text-gray-300">{row.best_wpm}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
