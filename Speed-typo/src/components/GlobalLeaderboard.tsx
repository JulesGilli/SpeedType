import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useI18n } from '../lib/i18n';
import { getTier } from '../lib/rank';
import {
  fetchGlobalLeaderboard,
  fetchMyGlobal,
  GlobalRow,
  LeaderboardPeriod,
  MyGlobalRow,
} from '../lib/leaderboard';

const TOP_N = 10;

// Badge de rang (Bronze -> Maître) dérivé du score global.
const TierBadge: React.FC<{ score: number }> = ({ score }) => {
  const { t } = useI18n();
  const tier = getTier(score);
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap"
      style={{
        color: tier.color,
        borderColor: `${tier.color}66`,
        backgroundColor: `${tier.color}1a`,
      }}
    >
      {t(`tier_${tier.key}`)}
    </span>
  );
};

const GRID = 'grid grid-cols-[2rem_1fr_auto_4.5rem] gap-2 px-3 py-2 items-center';

// Classement global : score = somme des meilleurs scores par mode, + rang.
const GlobalLeaderboard: React.FC<{ period: LeaderboardPeriod }> = ({ period }) => {
  const { user, profile, configured } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState<GlobalRow[]>([]);
  const [mine, setMine] = useState<MyGlobalRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchGlobalLeaderboard(period),
      user ? fetchMyGlobal(period) : Promise.resolve(null),
    ]).then(([data, my]) => {
      if (!cancelled) {
        setRows(data);
        setMine(my);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [period, configured, user]);

  const top = rows.slice(0, TOP_N);
  const meInTop = !!user && top.some((r) => r.user_id === user.id);

  return (
    <div className="bg-gray-900/60 rounded-lg overflow-hidden mt-3">
      <div className={`${GRID} text-xs text-gray-400 border-b border-gray-700`}>
        <div>#</div>
        <div>{t('colPlayer')}</div>
        <div className="text-right">{t('colRank')}</div>
        <div className="text-right">{t('colTotal')}</div>
      </div>

      {!configured ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('serverRequired')}</div>
      ) : loading ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('loading')}</div>
      ) : rows.length === 0 ? (
        <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('noScoresPeriod')}</div>
      ) : (
        top.map((row, index) => {
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
              className={`${GRID} text-sm border-b border-gray-700/50 last:border-0 ${isMe ? 'bg-purple-500/10' : ''}`}
            >
              <div className={`font-bold ${rankColor}`}>{index + 1}</div>
              <div className="truncate">
                <span className={isMe ? 'text-purple-300 font-semibold' : 'text-white'}>
                  {row.username}
                </span>
                {isMe && <span className="text-xs text-purple-400 ml-1">{t('you')}</span>}
              </div>
              <div className="text-right">
                <TierBadge score={row.total_score} />
              </div>
              <div className="text-right font-semibold text-green-400">{row.total_score}</div>
            </div>
          );
        })
      )}

      {/* Ligne épinglée du joueur (hors top 10 / non classé / non connecté). */}
      {configured && !loading && !meInTop && (
        !user ? (
          <div className="px-3 py-2.5 text-center text-xs text-purple-300 bg-purple-500/10 border-t-2 border-gray-700">
            {t('saveAnon')}
          </div>
        ) : mine ? (
          <div className={`${GRID} text-sm bg-purple-500/10 border-t-2 border-gray-700`}>
            <div className="font-bold text-gray-500">{mine.rank}</div>
            <div className="truncate">
              <span className="text-purple-300 font-semibold">{mine.username}</span>
              <span className="text-xs text-purple-400 ml-1">{t('you')}</span>
            </div>
            <div className="text-right">
              <TierBadge score={mine.total_score} />
            </div>
            <div className="text-right font-semibold text-green-400">{mine.total_score}</div>
          </div>
        ) : (
          <div className={`${GRID} text-sm bg-purple-500/10 border-t-2 border-gray-700`}>
            <div className="font-bold text-gray-600">–</div>
            <div className="truncate">
              <span className="text-purple-300 font-semibold">
                {profile?.username ?? user.email}
              </span>
              <span className="text-xs text-purple-400 ml-1">{t('you')}</span>
            </div>
            <div className="col-span-2 text-right text-gray-400 text-xs">{t('unranked')}</div>
          </div>
        )
      )}
    </div>
  );
};

export default GlobalLeaderboard;
