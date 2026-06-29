import { useState } from 'react';
import Segmented from './Segmented';
import GlobalLeaderboard from './GlobalLeaderboard';
import RankInfo from './RankInfo';
import { useI18n } from '../lib/i18n';
import { LeaderboardPeriod } from '../lib/leaderboard';

const PERIODS: { key: LeaderboardPeriod; tkey: string }[] = [
  { key: 'month', tkey: 'periodMonth' },
  { key: 'all', tkey: 'periodAll' },
];

// Rubrique "Rangs" : classement général (tous modes confondus, avec badge de
// rang) + explication des paliers.
const RankingContent: React.FC = () => {
  const { t } = useI18n();
  const [period, setPeriod] = useState<LeaderboardPeriod>('month');

  return (
    <div>
      <div className="flex justify-center mb-1">
        <Segmented
          options={PERIODS.map((p) => ({ key: p.key, label: t(p.tkey) }))}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <GlobalLeaderboard period={period} />

      <div className="mt-3">
        <RankInfo />
      </div>
    </div>
  );
};

export default RankingContent;
