import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HardcoreMode } from '../types/GameMode';
import { useAuth } from '../lib/AuthContext';
import { useI18n } from '../lib/i18n';
import {
  fetchLeaderboard,
  fetchMyRank,
  LeaderboardPeriod,
  LeaderboardRow,
  MyRankRow,
} from '../lib/leaderboard';

const TOP_N = 10;

const PERIODS: { key: LeaderboardPeriod; tkey: string }[] = [
  { key: 'month', tkey: 'periodMonth' },
  { key: 'all', tkey: 'periodAll' },
];

const MODES: { mode: HardcoreMode; tkey: string }[] = [
  { mode: 'chaos', tkey: 'chaosTitle' },
  { mode: 'sudden', tkey: 'suddenTitle' },
  { mode: 'blitz', tkey: 'blitzTitle' },
];

const GRID = 'grid grid-cols-[2rem_1fr_4.5rem_3.5rem] gap-2 px-3 py-2 items-center';

// Pilule rouge (DA hardcore) : active = dégradé rouge/orange.
const pill = (active: boolean) =>
  `px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
    active
      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow'
      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
  }`;

// Classement PAR MODE, version hardcore (chaos / mort subite). Même logique que
// le classement classique par mode, mais réservé aux modes hardcore et en rouge.
const HardcoreLeaderboardContent: React.FC = () => {
  const { user, profile, configured } = useAuth();
  const { t } = useI18n();
  const [period, setPeriod] = useState<LeaderboardPeriod>('month');
  const [mode, setMode] = useState<HardcoreMode>('chaos');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [myRank, setMyRank] = useState<MyRankRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchLeaderboard(period, mode),
      user ? fetchMyRank(period, mode) : Promise.resolve(null),
    ]).then(([data, mine]) => {
      if (!cancelled) {
        setRows(data);
        setMyRank(mine);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [period, mode, configured, user]);

  const showLoader = loading && rows.length === 0;
  const reloading = loading && rows.length > 0;
  const top = rows.slice(0, TOP_N);
  const meInTop = !!user && top.some((r) => r.user_id === user.id);
  const formatScore = (value: number) => `${value} pts`;

  return (
    <div>
      <div className="flex justify-center gap-1.5 mb-3">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)} className={pill(period === p.key)}>
            {t(p.tkey)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mb-1">
        {MODES.map((m) => (
          <button key={m.mode} onClick={() => setMode(m.mode)} className={pill(mode === m.mode)}>
            {t(m.tkey)}
          </button>
        ))}
      </div>

      <motion.div
        layout
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="bg-black/30 border border-red-500/20 rounded-lg overflow-hidden mt-3"
      >
        <div className={`${GRID} text-xs text-gray-400 border-b border-red-500/20`}>
          <div>#</div>
          <div>{t('colPlayer')}</div>
          <div className="text-right">{t('colScore')}</div>
          <div className="text-right">{t('wpm')}</div>
        </div>

        <div className={reloading ? 'opacity-50 transition-opacity duration-200' : 'transition-opacity duration-200'}>
          {!configured ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('serverRequired')}</div>
          ) : showLoader ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('loading')}</div>
          ) : rows.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-400 text-sm">{t('noScoresPeriod')}</div>
          ) : (
            top.map((row, index) => {
              const isMe = user?.id === row.user_id;
              const rankColor =
                index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-500';
              return (
                <div key={row.user_id} className={`${GRID} text-sm border-b border-red-500/10 last:border-0 ${isMe ? 'bg-red-500/10' : ''}`}>
                  <div className={`font-bold ${rankColor}`}>{index + 1}</div>
                  <div className="truncate">
                    <span className={isMe ? 'text-red-300 font-semibold' : 'text-white'}>{row.username}</span>
                    {isMe && <span className="text-xs text-red-400 ml-1">{t('you')}</span>}
                  </div>
                  <div className="text-right font-semibold text-orange-400">{formatScore(row.best_score)}</div>
                  <div className="text-right text-gray-300">{row.best_wpm}</div>
                </div>
              );
            })
          )}
        </div>

        {configured && !showLoader && !meInTop && (
          !user ? (
            <div className="px-3 py-2.5 text-center text-xs text-red-300 bg-red-500/10 border-t-2 border-red-500/20">
              {t('saveAnon')}
            </div>
          ) : myRank ? (
            <div className={`${GRID} text-sm bg-red-500/10 border-t-2 border-red-500/20`}>
              <div className="font-bold text-gray-500">{myRank.rank}</div>
              <div className="truncate">
                <span className="text-red-300 font-semibold">{myRank.username}</span>
                <span className="text-xs text-red-400 ml-1">{t('you')}</span>
              </div>
              <div className="text-right font-semibold text-orange-400">{formatScore(myRank.best_score)}</div>
              <div className="text-right text-gray-300">{myRank.best_wpm}</div>
            </div>
          ) : (
            <div className={`${GRID} text-sm bg-red-500/10 border-t-2 border-red-500/20`}>
              <div className="font-bold text-gray-600">–</div>
              <div className="truncate">
                <span className="text-red-300 font-semibold">{profile?.username ?? user.email}</span>
                <span className="text-xs text-red-400 ml-1">{t('you')}</span>
              </div>
              <div className="col-span-2 text-right text-gray-400 text-xs">{t('unranked')}</div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default HardcoreLeaderboardContent;
