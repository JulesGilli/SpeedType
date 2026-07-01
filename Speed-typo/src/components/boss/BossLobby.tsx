import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../lib/i18n';
import {
  BossProgress,
  toggleEquip,
  upgrade,
  openBooster,
} from '../../lib/boss/bossProgress';
import {
  CARD_BY_ID,
  RARITY_COLOR,
  MAX_DECK,
  BOOSTER_COST,
  TOTAL_PHASES,
  upgradeCost,
  cardDamage,
  cardHeal,
  CardDef,
} from '../../lib/boss/bossData';

interface BossLobbyProps {
  progress: BossProgress;
  setProgress: (p: BossProgress) => void;
  onFight: () => void;
  onBack: () => void;
}

const kindIcon = (c: CardDef) =>
  c.kind === 'attack' ? '⚔' : c.kind === 'defense' ? (c.defense === 'shield' ? '🛡' : '✋') : c.spell === 'heal' ? '✚' : '⚡';

const BossLobby: React.FC<BossLobbyProps> = ({ progress, setProgress, onFight, onBack }) => {
  const { t } = useI18n();
  const [reveal, setReveal] = useState<{ card: CardDef; isNew: boolean } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const owned = progress.owned;
  const ownedIds = Object.keys(owned);

  const statLabel = (c: CardDef, level: number) => {
    if (c.kind === 'attack') return `⚔ ${cardDamage(c, level)}`;
    if (c.kind === 'spell' && c.spell === 'heal') return `✚ ${cardHeal(c, level)}`;
    if (c.kind === 'spell') return `⚡ ${(c.durationMs ?? 0) / 1000}s`;
    if (c.defense === 'shield') return `🛡 ${(c.durationMs ?? 0) / 1000}s`;
    return '✋';
  };

  const handleBooster = () => {
    const { progress: np, card, isNew } = openBooster(progress);
    if (!card) {
      setFlash(t('bossNotEnoughGold'));
      window.setTimeout(() => setFlash(null), 1500);
      return;
    }
    setProgress(np);
    setReveal({ card, isNew });
  };

  const handleUpgrade = (id: string) => {
    const { progress: np, ok } = upgrade(progress, id);
    if (!ok) {
      setFlash(t('bossNotEnoughGold'));
      window.setTimeout(() => setFlash(null), 1500);
      return;
    }
    setProgress(np);
  };

  return (
    <div className="max-w-3xl w-full">
      {/* En-tête : titre + or */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          {t('bossTitle')}
        </h1>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 ring-1 ring-yellow-500/40">
          <span className="text-yellow-400 text-lg">🪙</span>
          <span className="font-bold text-yellow-300">{progress.gold}</span>
        </div>
      </div>

      {/* Meilleure progression (boss-rush 10 phases) */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-gray-400 whitespace-nowrap">{t('bossBestProgress')}</span>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: TOTAL_PHASES }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full"
              style={{ background: i < progress.bestPhase ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <span className="text-xs font-bold text-orange-300 whitespace-nowrap">{progress.bestPhase}/{TOTAL_PHASES}</span>
      </div>

      {flash && <div className="mb-3 text-center text-sm text-red-300">{flash}</div>}

      {/* Deck équipé */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-300">{t('bossDeck')} ({progress.deck.length}/{MAX_DECK})</h2>
        <span className="text-xs text-gray-500">{t('bossDeckHint')}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {Array.from({ length: MAX_DECK }).map((_, i) => {
          const id = progress.deck[i];
          const c = id ? CARD_BY_ID[id] : null;
          if (!c) {
            return <div key={i} className="rounded-lg h-16 border border-dashed border-white/15 bg-white/5" />;
          }
          const color = RARITY_COLOR[c.rarity];
          return (
            <button key={i} onClick={() => setProgress(toggleEquip(progress, id))}
              className="rounded-lg h-16 px-1 flex flex-col items-center justify-center bg-gray-800 ring-1 hover:brightness-110"
              style={{ ['--tw-ring-color' as string]: `${color}88`, boxShadow: `0 0 8px ${color}44` }}
              title={t('bossUnequip')}>
              <span className="text-sm font-bold truncate max-w-full" style={{ color }}>{c.word}</span>
              <span className="text-[10px] text-gray-400">{kindIcon(c)} Lv{owned[id]?.level ?? 1}</span>
            </button>
          );
        })}
      </div>

      {/* Collection */}
      <h2 className="text-sm font-bold text-gray-300 mb-2">{t('bossCollection')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5 max-h-[34vh] overflow-y-auto nice-scroll pr-1">
        {ownedIds.map((id) => {
          const c = CARD_BY_ID[id];
          const o = owned[id];
          const color = RARITY_COLOR[c.rarity];
          const equipped = progress.deck.includes(id);
          const cost = upgradeCost(o.level);
          return (
            <div key={id} className="rounded-lg p-2.5 bg-gray-800/80 ring-1" style={{ ['--tw-ring-color' as string]: `${color}55` }}>
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color }}>{c.word}</span>
                <span className="text-[10px] uppercase tracking-wider" style={{ color }}>{t(`bossRarity_${c.rarity}`)}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{statLabel(c, o.level)} · Lv{o.level} · {(c.cooldownMs / 1000).toFixed(1)}s</div>
              <div className="flex gap-1.5 mt-2">
                <button onClick={() => setProgress(toggleEquip(progress, id))}
                  disabled={!equipped && progress.deck.length >= MAX_DECK}
                  className={`flex-1 text-xs py-1 rounded ${equipped ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300 disabled:opacity-40'}`}>
                  {equipped ? t('bossUnequip') : t('bossEquip')}
                </button>
                <button onClick={() => handleUpgrade(id)}
                  className="flex-1 text-xs py-1 rounded bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25">
                  ⬆ {cost}🪙
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions : booster + combattre */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleBooster}
          className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 shadow-lg">
          🎁 {t('bossOpenBooster')} · {BOOSTER_COST}🪙
        </button>
        <button onClick={onFight} disabled={progress.deck.length === 0}
          className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 shadow-lg disabled:opacity-40">
          ⚔ {t('bossFight')}
        </button>
      </div>

      <button onClick={onBack} className="mt-4 w-full text-sm px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
        {t('back')}
      </button>

      {/* Révélation de booster */}
      <AnimatePresence>
        {reveal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReveal(null)}>
            <motion.div
              initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="rounded-2xl p-8 text-center bg-gray-900 ring-2 max-w-xs w-full"
              style={{ ['--tw-ring-color' as string]: RARITY_COLOR[reveal.card.rarity], boxShadow: `0 0 50px ${RARITY_COLOR[reveal.card.rarity]}` }}>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: RARITY_COLOR[reveal.card.rarity] }}>
                {t(`bossRarity_${reveal.card.rarity}`)}
              </div>
              <div className="text-4xl mb-2">{kindIcon(reveal.card)}</div>
              <div className="text-3xl font-extrabold mb-1" style={{ color: RARITY_COLOR[reveal.card.rarity] }}>{reveal.card.word}</div>
              <div className="text-sm text-gray-400">{reveal.isNew ? t('bossNewCard') : t('bossDuplicate')}</div>
              <button onClick={() => setReveal(null)} className="mt-5 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
                {t('bossClose')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BossLobby;
