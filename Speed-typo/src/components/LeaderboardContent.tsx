import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Segmented from './Segmented';
import { GameMode } from '../types/GameMode';
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

const MODES: GameMode[] = ['classique', 'inversé', 'leet', 'memoire', 'blind', 'endless'];

const GRID = 'grid grid-cols-[2rem_1fr_4.5rem_3.5rem] gap-2 px-3 py-2 items-center';

// Classement PAR MODE (dock de droite). Le classement général / les rangs
// sont dans la rubrique dédiée (dock de gauche).
const LeaderboardContent: React.FC = () => {
  const { user, profile, configured } = useAuth();
  const { t, modeLabel } = useI18n();
  const [period, setPeriod] = useState<LeaderboardPeriod>('month');
  const [mode, setMode] = useState<GameMode>('classique');
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
      <div className="flex justify-center mb-3">
        <Segmented
          options={PERIODS.map((p) => ({ key: p.key, label: t(p.tkey) }))}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mb-1">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
              ${mode === m
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}
            `}
          >
            {modeLabel(m)}
          </button>
        ))}
      </div>

      <motion.div
        layout
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="bg-gray-900/60 rounded-lg overflow-hidden mt-3"
      >
        <div className={`${GRID} text-xs text-gray-400 border-b border-gray-700`}>
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
                <div key={row.user_id} className={`${GRID} text-sm border-b border-gray-700/50 last:border-0 ${isMe ? 'bg-purple-500/10' : ''}`}>
                  <div className={`font-bold ${rankColor}`}>{index + 1}</div>
                  <div className="truncate">
                    <span className={isMe ? 'text-purple-300 font-semibold' : 'text-white'}>{row.username}</span>
                    {isMe && <span className="text-xs text-purple-400 ml-1">{t('you')}</span>}
                  </div>
                  <div className="text-right font-semibold text-green-400">{formatScore(row.best_score)}</div>
                  <div className="text-right text-gray-300">{row.best_wpm}</div>
                </div>
              );
            })
          )}
        </div>

        {configured && !showLoader && !meInTop && (
          !user ? (
            <div className="px-3 py-2.5 text-center text-xs text-purple-300 bg-purple-500/10 border-t-2 border-gray-700">
              {t('saveAnon')}
            </div>
          ) : myRank ? (
            <div className={`${GRID} text-sm bg-purple-500/10 border-t-2 border-gray-700`}>
              <div className="font-bold text-gray-500">{myRank.rank}</div>
              <div className="truncate">
                <span className="text-purple-300 font-semibold">{myRank.username}</span>
                <span className="text-xs text-purple-400 ml-1">{t('you')}</span>
              </div>
              <div className="text-right font-semibold text-green-400">{formatScore(myRank.best_score)}</div>
              <div className="text-right text-gray-300">{myRank.best_wpm}</div>
            </div>
          ) : (
            <div className={`${GRID} text-sm bg-purple-500/10 border-t-2 border-gray-700`}>
              <div className="font-bold text-gray-600">–</div>
              <div className="truncate">
                <span className="text-purple-300 font-semibold">{profile?.username ?? user.email}</span>
                <span className="text-xs text-purple-400 ml-1">{t('you')}</span>
              </div>
              <div className="col-span-2 text-right text-gray-400 text-xs">{t('unranked')}</div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default LeaderboardContent;
