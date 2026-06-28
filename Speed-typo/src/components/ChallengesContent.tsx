import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import {
  fetchMyChallenges,
  fetchChallengeLeaderboard,
  ChallengeRow,
  ChallengeRankRow,
} from '../lib/challenges';

const DIFFICULTY_STYLE: Record<string, { label: string; className: string }> = {
  facile: { label: 'Facile', className: 'text-green-400' },
  moyen: { label: 'Moyen', className: 'text-blue-400' },
  difficile: { label: 'Difficile', className: 'text-orange-400' },
  extreme: { label: 'Extrême', className: 'text-pink-500' },
};

type Tab = 'list' | 'ranking';

const ChallengesContent: React.FC = () => {
  const { user, profile, configured } = useAuth();
  const [tab, setTab] = useState<Tab>('list');
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [ranking, setRanking] = useState<ChallengeRankRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const load =
      tab === 'list'
        ? fetchMyChallenges(Boolean(user)).then((d) => !cancelled && setChallenges(d))
        : fetchChallengeLeaderboard().then((d) => !cancelled && setRanking(d));
    load.finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, configured, user]);

  const myPoints = challenges.reduce((sum, c) => sum + c.points_earned, 0);

  return (
    <div>
      {/* Onglets */}
      <div className="flex justify-center gap-2 mb-3">
        {([
          { key: 'list', label: 'Défis du mois' },
          { key: 'ranking', label: 'Classement défis' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200
              ${tab === t.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!configured ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">
          Connexion au serveur requise.
        </div>
      ) : loading ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">Chargement…</div>
      ) : tab === 'list' ? (
        <div>
          {user && (
            <div className="text-center text-sm text-gray-300 mb-3">
              Tes points de défis ce mois :{' '}
              <span className="text-purple-400 font-bold">{myPoints}</span>
            </div>
          )}
          {challenges.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">
              Les défis du mois arrivent bientôt.
            </div>
          ) : (
            <div className="space-y-2">
              {challenges.map((c) => {
                const diff = DIFFICULTY_STYLE[c.difficulty] ?? {
                  label: c.difficulty,
                  className: 'text-gray-400',
                };
                return (
                  <div
                    key={c.id}
                    className={`rounded-lg p-3 border ${c.completed
                      ? 'bg-green-500/10 border-green-500/40'
                      : 'bg-gray-900/60 border-gray-700'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white text-sm">{c.title}</span>
                      <span className={`text-xs font-bold ${diff.className}`}>{diff.label}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{c.description}</div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-500">{c.base_points} pts de base</span>
                      {c.completed ? (
                        <span className="text-green-400 font-semibold">
                          Validé · +{c.points_earned} pts
                        </span>
                      ) : (
                        <span className="text-gray-500">À réaliser</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/60 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_5rem] gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
            <div>#</div>
            <div>Joueur</div>
            <div className="text-right">Points</div>
          </div>
          {ranking.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">
              Personne n’a encore marqué de points. À toi de jouer !
            </div>
          ) : (
            ranking.map((row, index) => {
              const isMe = profile?.username === row.username;
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
                  className={`grid grid-cols-[2rem_1fr_5rem] gap-2 px-3 py-2 items-center text-sm border-b border-gray-700/50 last:border-0
                    ${isMe ? 'bg-purple-500/10' : ''}
                  `}
                >
                  <div className={`font-bold ${rankColor}`}>{index + 1}</div>
                  <div className="truncate">
                    <span className={isMe ? 'text-purple-300 font-semibold' : 'text-white'}>
                      {row.username}
                    </span>
                  </div>
                  <div className="text-right font-semibold text-purple-400">
                    {row.challenge_points}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengesContent;
