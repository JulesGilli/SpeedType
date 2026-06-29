import { useI18n } from '../lib/i18n';
import { TIERS } from '../lib/rank';

const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');

// Panneau d'explication des rangs (badges + seuils de score global).
const RankInfo: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="mb-3 rounded-lg bg-gray-900/70 border border-white/10 p-3">
      <div className="font-semibold text-white text-sm mb-1">{t('rankInfoTitle')}</div>
      <p className="text-xs text-gray-400 mb-3">{t('rankInfoHint')}</p>
      <div className="space-y-1.5">
        {TIERS.map((tier, i) => {
          const next = TIERS[i + 1];
          const range = next ? `${fmt(tier.min)} – ${fmt(next.min - 1)}` : `${fmt(tier.min)}+`;
          return (
            <div key={tier.key} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="text-gray-200 font-medium">{t(`tier_${tier.key}`)}</span>
              </span>
              <span className="text-gray-400">{range} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankInfo;
