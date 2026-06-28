import { useEffect, useState } from 'react';
import GameModeSelector from './GameModeSelector';
import { GameMode } from '../types/GameMode';
import { useAuth } from '../lib/AuthContext';
import {
  fetchLeaderboard,
  LeaderboardPeriod,
  LeaderboardRow,
} from '../lib/leaderboard';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout temps' },
];

// Contenu du classement (sélecteurs + tableau), sans chrome de page.
// Réutilisé par le dock repliable de l'accueil.
const LeaderboardContent: React.FC = () => {
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
    <div>
      {/* Sélecteur de période */}
      <div className="flex justify-center gap-2 mb-3 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200
              ${period === p.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Sélecteur de mode */}
      <GameModeSelector selectedMode={mode} onSelectMode={setMode} />

      <div className="bg-gray-900/60 rounded-lg overflow-hidden mt-3">
        <div className="grid grid-cols-[2rem_1fr_4.5rem_3.5rem] gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
          <div>#</div>
          <div>Joueur</div>
          <div className="text-right">Score</div>
          <div className="text-right">WPM</div>
        </div>

        {!configured ? (
          <div className="px-3 py-8 text-center text-gray-400 text-sm">
            Connexion au serveur requise.
          </div>
        ) : loading ? (
          <div className="px-3 py-8 text-center text-gray-400 text-sm">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="px-3 py-8 text-center text-gray-400 text-sm">
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
                className={`grid grid-cols-[2rem_1fr_4.5rem_3.5rem] gap-2 px-3 py-2 items-center text-sm border-b border-gray-700/50 last:border-0
                  ${isMe ? 'bg-purple-500/10' : ''}
                `}
              >
                <div className={`font-bold ${rankColor}`}>{index + 1}</div>
                <div className="truncate">
                  <span className={isMe ? 'text-purple-300 font-semibold' : 'text-white'}>
                    {row.username}
                  </span>
                  {isMe && <span className="text-xs text-purple-400 ml-1">(toi)</span>}
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

export default LeaderboardContent;
