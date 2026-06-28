import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useI18n } from '../lib/i18n';
import {
  fetchMyChallenges,
  fetchChallengeLeaderboard,
  ChallengeRow,
  ChallengeRankRow,
} from '../lib/challenges';

const DIFFICULTY_CLASS: Record<string, string> = {
  facile: 'text-green-400',
  moyen: 'text-blue-400',
  difficile: 'text-orange-400',
  extreme: 'text-pink-500',
};

type Tab = 'list' | 'ranking';

const ChallengesContent: React.FC = () => {
  const { user, profile, configured } = useAuth();
  const { t } = useI18n();
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
          { key: 'list', tkey: 'tabChallenges' },
          { key: 'ranking', tkey: 'tabRanking' },
        ] as { key: Tab; tkey: string }[]).map((tab2) => (
          <button
            key={tab2.key}
            onClick={() => setTab(tab2.key)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200
              ${tab === tab2.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
            `}
          >
            {t(tab2.tkey)}
          </button>
        ))}
      </div>

      {!configured ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">
          {t('serverRequired')}
        </div>
      ) : loading ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('loading')}</div>
      ) : tab === 'list' ? (
        <div>
          {user && (
            <div className="text-center text-sm text-gray-300 mb-3">
              {t('yourChallengePoints')}{' '}
              <span className="text-purple-400 font-bold">{myPoints}</span>
            </div>
          )}
          {challenges.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">
              {t('noChallengesYet')}
            </div>
          ) : (
            <div className="space-y-2">
              {challenges.map((c) => {
                const diffClass = DIFFICULTY_CLASS[c.difficulty] ?? 'text-gray-400';
                const diffLabel = t(`diff_${c.difficulty}`);
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
                      <span className={`text-xs font-bold ${diffClass}`}>{diffLabel}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{c.description}</div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-500">{c.base_points} {t('basePoints')}</span>
                      {c.completed ? (
                        <span className="text-green-400 font-semibold">
                          {t('validated')} · +{c.points_earned} pts
                        </span>
                      ) : (
                        <span className="text-gray-500">{t('toDo')}</span>
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
            <div>{t('colPlayer')}</div>
            <div className="text-right">{t('colPoints')}</div>
          </div>
          {ranking.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">
              {t('noOneScored')}
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
