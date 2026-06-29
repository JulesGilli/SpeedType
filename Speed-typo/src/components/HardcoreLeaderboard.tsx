import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useI18n } from '../lib/i18n';
import {
  fetchHardcoreLeaderboard,
  fetchMyHardcore,
  GlobalRow,
  MyGlobalRow,
} from '../lib/leaderboard';
import { HARDCORE_MIN } from '../lib/rank';

const TOP_N = 10;

// Classement hardcore cumulé (all-time), thème rouge.
const HardcoreLeaderboard: React.FC = () => {
  const { user, configured } = useAuth();
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
    Promise.all([
      fetchHardcoreLeaderboard(HARDCORE_MIN),
      user ? fetchMyHardcore(HARDCORE_MIN) : Promise.resolve(null),
    ]).then(([data, m]) => {
      if (!cancelled) {
        setRows(data);
        setMine(m);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  const top = rows.slice(0, TOP_N);
  const meInTop = !!user && top.some((r) => r.user_id === user.id);

  return (
    <div className="mt-2 text-left">
      <div className="text-sm font-semibold text-red-300 mb-2 text-center">
        {t('leaderboard')} · {t('hardcore')}
      </div>
      <div className="bg-black/30 border border-red-500/20 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_5rem] gap-2 px-3 py-2 text-xs text-gray-400 border-b border-red-500/20">
          <div>#</div>
          <div>{t('colPlayer')}</div>
          <div className="text-right">{t('colScore')}</div>
        </div>

        {!configured ? (
          <div className="px-3 py-6 text-center text-gray-400 text-sm">{t('serverRequired')}</div>
        ) : loading ? (
          <div className="px-3 py-6 text-center text-gray-400 text-sm">{t('loading')}</div>
        ) : rows.length === 0 ? (
          <div className="px-3 py-6 text-center text-gray-400 text-sm">{t('noScoresPeriod')}</div>
        ) : (
          top.map((row, index) => {
            const isMe = user?.id === row.user_id;
            const rankColor =
              index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-500';
            return (
              <div
                key={row.user_id}
                className={`grid grid-cols-[2rem_1fr_5rem] gap-2 px-3 py-2 items-center text-sm border-b border-red-500/10 last:border-0 ${isMe ? 'bg-red-500/10' : ''}`}
              >
                <div className={`font-bold ${rankColor}`}>{index + 1}</div>
                <div className="truncate">
                  <span className={isMe ? 'text-red-300 font-semibold' : 'text-white'}>{row.username}</span>
                  {isMe && <span className="text-xs text-red-400 ml-1">{t('you')}</span>}
                </div>
                <div className="text-right font-semibold text-orange-400">{row.total_score} pts</div>
              </div>
            );
          })
        )}

        {configured && !loading && !meInTop && (
          !user ? (
            <div className="px-3 py-2.5 text-center text-xs text-red-300 bg-red-500/10 border-t-2 border-red-500/20">
              {t('saveAnon')}
            </div>
          ) : mine ? (
            <div className="grid grid-cols-[2rem_1fr_5rem] gap-2 px-3 py-2 items-center text-sm bg-red-500/10 border-t-2 border-red-500/20">
              <div className="font-bold text-gray-500">{mine.rank}</div>
              <div className="truncate">
                <span className="text-red-300 font-semibold">{mine.username}</span>
                <span className="text-xs text-red-400 ml-1">{t('you')}</span>
              </div>
              <div className="text-right font-semibold text-orange-400">{mine.total_score} pts</div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default HardcoreLeaderboard;
