import { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '../../lib/i18n';
import {
  BOSS_PHASES,
  PLAYER_MAX_HP,
  WIN_BONUS_GOLD,
  GOLD_PER_DAMAGE,
  RARITY_COLOR,
  CardDef,
  cardDamage,
  cardHeal,
  pickBossWord,
  randomIncantation,
} from '../../lib/boss/bossData';

export interface BossOutcome {
  win: boolean;
  goldEarned: number;
  phasesCleared: number;
  totalPhases: number;
  damageDealt: number;
  wordsTyped: number;
  durationSec: number;
}

interface DeckEntry {
  card: CardDef;
  level: number;
}

interface BossArenaProps {
  deck: DeckEntry[];
  onEnd: (outcome: BossOutcome) => void;
  onQuit: () => void;
}

type ProjKind = 'player' | 'boss';
interface Projectile {
  id: number;
  kind: ProjKind;
  word: string;
  born: number; // instant de lancement (les boss peuvent être différés dans une salve)
  ttl: number;
  dmg: number;
  lane: number; // -1..1, décalage horizontal
  color: string;
  hp: number; // coups de parade nécessaires (blindé = 2)
  maxHp: number;
  dead?: boolean;
}

interface Fx {
  id: number;
  type: 'break' | 'crack' | 'hitBoss' | 'hitPlayer' | 'text';
  born: number;
  top?: number; // %
  left?: number; // %
  text?: string;
  color?: string;
}

interface Incant {
  word: string;
  deadline: number;
  castMs: number;
}

const now = () => performance.now();

const BossArena: React.FC<BossArenaProps> = ({ deck, onEnd, onQuit }) => {
  const { t } = useI18n();

  // --- État du moteur (refs : lus dans la boucle d'animation) ---
  const phaseIdxRef = useRef(0);
  const bossHpRef = useRef(BOSS_PHASES[0].maxHp);
  const playerHpRef = useRef(PLAYER_MAX_HP);
  const projsRef = useRef<Projectile[]>([]);
  const cooldownsRef = useRef<Record<string, number>>({});
  const shieldUntilRef = useRef(0);
  const rageUntilRef = useRef(0);
  const nextVolleyRef = useRef(0);
  const nextIncantRef = useRef(Infinity);
  const incantRef = useRef<Incant | null>(null);
  const startRef = useRef(0);
  const wordsRef = useRef(0);
  const damageRef = useRef(0);
  const goldRef = useRef(0);
  const fxRef = useRef<Fx[]>([]);
  const bannerRef = useRef<{ text: string; until: number } | null>(null);
  const statusRef = useRef<'fighting' | 'won' | 'lost'>('fighting');
  const endedRef = useRef(false);
  const idRef = useRef(1);
  const rafRef = useRef<number>(0);
  const inputElRef = useRef<HTMLInputElement>(null);

  const [, setFrame] = useState(0);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [bossHitFlash, setBossHitFlash] = useState(false);

  const nextId = () => idRef.current++;

  const pushFx = (fx: Omit<Fx, 'id' | 'born'>) => {
    fxRef.current.push({ ...fx, id: nextId(), born: now() });
  };

  // Position verticale (%) d'un projectile boss selon sa progression.
  const bossProjTop = (p: Projectile, t0: number) => {
    if (p.born > t0) return 13; // pas encore lancé : groupé près du boss
    return 14 + Math.min(1, (t0 - p.born) / p.ttl) * 70;
  };

  const finish = useCallback(
    (win: boolean) => {
      if (endedRef.current) return;
      endedRef.current = true;
      statusRef.current = win ? 'won' : 'lost';
      // Défaite : on récompense quand même les dégâts infligés à la phase en cours
      // (les phases franchies ont déjà donné leur or). Évite de repartir les mains vides.
      if (!win) {
        const ph = BOSS_PHASES[phaseIdxRef.current];
        const partial = Math.max(0, ph.maxHp - bossHpRef.current);
        goldRef.current += Math.round(partial * GOLD_PER_DAMAGE);
      }
      const elapsed = Math.max(1, (now() - startRef.current) / 1000);
      window.setTimeout(() => {
        onEnd({
          win,
          goldEarned: goldRef.current,
          phasesCleared: win ? BOSS_PHASES.length : phaseIdxRef.current,
          totalPhases: BOSS_PHASES.length,
          damageDealt: Math.round(damageRef.current),
          wordsTyped: wordsRef.current,
          durationSec: Math.round(elapsed),
        });
      }, 1100);
    },
    [onEnd]
  );

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 200);
  };

  // --- Boucle de jeu (rAF) ---
  useEffect(() => {
    startRef.current = now();
    nextVolleyRef.current = now() + 1200;
    const p0 = BOSS_PHASES[0];
    nextIncantRef.current = p0.incantation ? now() + p0.incantation.everyMs : Infinity;
    inputElRef.current?.focus();

    const loop = () => {
      const t0 = now();
      if (statusRef.current === 'fighting') {
        const phase = BOSS_PHASES[phaseIdxRef.current];

        // Déclenchement d'une incantation (coup fatal).
        if (phase.incantation && !incantRef.current && t0 >= nextIncantRef.current) {
          incantRef.current = { word: randomIncantation(), deadline: t0 + phase.incantation.castMs, castMs: phase.incantation.castMs };
        }
        // Incantation non contrée à temps → dégâts fatals.
        if (incantRef.current && t0 >= incantRef.current.deadline) {
          const dmg = phase.incantation?.damage ?? 999;
          playerHpRef.current -= dmg;
          pushFx({ type: 'text', top: 50, left: 50, text: '☠', color: '#ef4444' });
          triggerShake();
          incantRef.current = null;
          nextIncantRef.current = t0 + (phase.incantation?.everyMs ?? Infinity);
          nextVolleyRef.current = t0 + 900;
          if (playerHpRef.current <= 0) {
            playerHpRef.current = 0;
            finish(false);
          }
        }

        const channeling = !!incantRef.current;

        // Salve : on lance plusieurs mots rapprochés (suspendu pendant une incantation).
        if (!channeling && t0 >= nextVolleyRef.current) {
          // Mots déjà en jeu : on évite les doublons pour que taper un nom vise sans ambiguïté.
          const used = new Set<string>();
          for (const p of projsRef.current) if (p.kind === 'boss' && !p.dead) used.add(p.word);
          for (let i = 0; i < phase.salvoSize; i++) {
            const armored = Math.random() < phase.shieldedChance;
            const word = pickBossWord(used);
            used.add(word);
            projsRef.current.push({
              id: nextId(),
              kind: 'boss',
              word,
              born: t0 + i * phase.salvoGapMs,
              ttl: phase.travelMs,
              dmg: phase.damage,
              lane: (Math.random() * 2 - 1) * 0.8,
              color: phase.color,
              hp: armored ? 2 : 1,
              maxHp: armored ? 2 : 1,
            });
          }
          nextVolleyRef.current = t0 + phase.volleyIntervalMs + phase.salvoSize * phase.salvoGapMs;
        }

        // Avancement / collisions des projectiles.
        const survivors: Projectile[] = [];
        let phaseChanged = false;
        for (const p of projsRef.current) {
          if (p.dead) continue;
          // Projectile boss pas encore lancé : il attend près du boss.
          if (p.kind === 'boss' && p.born > t0) {
            survivors.push(p);
            continue;
          }
          const prog = (t0 - p.born) / p.ttl;
          if (prog < 1) {
            survivors.push(p);
            continue;
          }
          if (p.kind === 'player') {
            bossHpRef.current -= p.dmg;
            damageRef.current += p.dmg;
            setBossHitFlash(true);
            window.setTimeout(() => setBossHitFlash(false), 140);
            pushFx({ type: 'hitBoss', top: 13, left: 50, text: `-${p.dmg}`, color: '#fca5a5' });
            if (bossHpRef.current <= 0) {
              goldRef.current += phase.goldReward;
              if (phaseIdxRef.current < BOSS_PHASES.length - 1) {
                phaseIdxRef.current += 1;
                const np = BOSS_PHASES[phaseIdxRef.current];
                bossHpRef.current = np.maxHp;
                projsRef.current = [];
                incantRef.current = null;
                nextVolleyRef.current = t0 + 1500;
                nextIncantRef.current = np.incantation ? t0 + np.incantation.everyMs : Infinity;
                bannerRef.current = { text: `${np.name} — PHASE ${phaseIdxRef.current + 1}`, until: t0 + 1800 };
                phaseChanged = true;
                break;
              } else {
                goldRef.current += WIN_BONUS_GOLD;
                finish(true);
                break;
              }
            }
          } else {
            // Projectile boss qui atteint le joueur.
            if (shieldUntilRef.current > t0) {
              shieldUntilRef.current = 0;
              pushFx({ type: 'break', top: 82, left: 50 + p.lane * 30, color: '#38bdf8' });
              pushFx({ type: 'text', top: 74, left: 50, text: t('bossShieldBlock'), color: '#38bdf8' });
            } else {
              playerHpRef.current -= p.dmg;
              pushFx({ type: 'hitPlayer', top: 82, left: 50, text: `-${p.dmg}`, color: '#fca5a5' });
              triggerShake();
              if (playerHpRef.current <= 0) {
                playerHpRef.current = 0;
                finish(false);
              }
            }
          }
        }
        if (!phaseChanged) projsRef.current = survivors;
      }

      fxRef.current = fxRef.current.filter((f) => t0 - f.born < 1000);
      if (bannerRef.current && t0 > bannerRef.current.until) bannerRef.current = null;

      setFrame((f) => (f + 1) % 1000000);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parade de zone : entame tous les projectiles boss DÉJÀ lancés.
  const parryWave = (fxColor: string) => {
    const t0 = now();
    for (const p of projsRef.current) {
      if (p.kind !== 'boss' || p.dead || p.born > t0) continue;
      p.hp -= 1;
      const top = bossProjTop(p, t0);
      if (p.hp <= 0) {
        p.dead = true;
        pushFx({ type: 'break', top, left: 50 + p.lane * 30, color: fxColor });
      } else {
        // Blindé fissuré : il faut une seconde parade.
        pushFx({ type: 'crack', top, left: 50 + p.lane * 30, color: '#f59e0b' });
      }
    }
  };

  // --- Activation d'une carte par la frappe ---
  const activateCard = (entry: DeckEntry) => {
    const { card, level } = entry;
    const t0 = now();
    const ready = (cooldownsRef.current[card.id] ?? 0) <= t0;
    if (!ready) {
      triggerShake();
      return;
    }
    cooldownsRef.current[card.id] = t0 + card.cooldownMs;
    wordsRef.current += 1;

    if (card.kind === 'attack') {
      const dmg = Math.round(cardDamage(card, level) * (rageUntilRef.current > t0 ? 2 : 1));
      projsRef.current.push({
        id: nextId(),
        kind: 'player',
        word: card.word,
        born: t0,
        ttl: 650,
        dmg,
        lane: (Math.random() * 2 - 1) * 0.6,
        color: RARITY_COLOR[card.rarity],
        hp: 1,
        maxHp: 1,
      });
    } else if (card.kind === 'defense') {
      if (card.defense === 'destroy') {
        parryWave(card.id === 'parade' ? '#fbbf24' : '#a3e635');
        pushFx({ type: 'text', top: 74, left: 50, text: card.word.toUpperCase(), color: '#fbbf24' });
      } else if (card.defense === 'shield') {
        shieldUntilRef.current = t0 + (card.durationMs ?? 4000);
        pushFx({ type: 'text', top: 74, left: 50, text: t('bossShieldOn'), color: '#38bdf8' });
      }
    } else if (card.kind === 'spell') {
      if (card.spell === 'heal') {
        const h = cardHeal(card, level);
        playerHpRef.current = Math.min(PLAYER_MAX_HP, playerHpRef.current + h);
        pushFx({ type: 'text', top: 74, left: 50, text: `+${h} PV`, color: '#4ade80' });
      } else if (card.spell === 'rage') {
        rageUntilRef.current = t0 + (card.durationMs ?? 6000);
        pushFx({ type: 'text', top: 74, left: 50, text: t('bossRageOn'), color: '#f97316' });
      }
    }
  };

  const handleChange = (value: string) => {
    if (statusRef.current !== 'fighting') return;
    setInput(value);
    const ci = value.trim().toLowerCase();
    if (ci.length === 0) return;

    // Priorité : contrer l'incantation en cours.
    const inc = incantRef.current;
    if (inc && ci === inc.word.toLowerCase()) {
      incantRef.current = null;
      const phase = BOSS_PHASES[phaseIdxRef.current];
      nextIncantRef.current = phase.incantation ? now() + phase.incantation.everyMs : Infinity;
      nextVolleyRef.current = now() + 900;
      wordsRef.current += 1;
      pushFx({ type: 'text', top: 50, left: 50, text: t('bossIncantCountered'), color: '#fbbf24' });
      setInput('');
      return;
    }

    // Détruire une attaque ennemie en tapant son nom (1 fois suffit, même blindée).
    // On vise le projectile lancé le plus proche du joueur ; à défaut un en attente.
    const t1 = now();
    let target: Projectile | null = null;
    let bestProg = -Infinity;
    for (const p of projsRef.current) {
      if (p.kind !== 'boss' || p.dead || p.word.toLowerCase() !== ci) continue;
      const prog = p.born > t1 ? -1 : (t1 - p.born) / p.ttl;
      if (prog > bestProg) {
        bestProg = prog;
        target = p;
      }
    }
    if (target) {
      target.dead = true;
      wordsRef.current += 1;
      pushFx({ type: 'break', top: bossProjTop(target, t1), left: 50 + target.lane * 30, color: '#fbbf24' });
      setInput('');
      return;
    }

    // Correspondance exacte avec une carte équipée → activation.
    const exact = deck.find((e) => e.card.word.toLowerCase() === ci);
    if (exact) {
      activateCard(exact);
      setInput('');
      return;
    }
    // Aucune cible (carte, incantation ou attaque ennemie) ne commence par ce qui est tapé → faute.
    const incPrefix = !!inc && inc.word.toLowerCase().startsWith(ci);
    const bossPrefix = projsRef.current.some(
      (p) => p.kind === 'boss' && !p.dead && p.word.toLowerCase().startsWith(ci)
    );
    const anyPrefix = incPrefix || bossPrefix || deck.some((e) => e.card.word.toLowerCase().startsWith(ci));
    if (!anyPrefix) {
      setInput('');
      triggerShake();
    }
  };

  // --- Données de rendu ---
  const t0 = now();
  const phase = BOSS_PHASES[phaseIdxRef.current];
  const bossRatio = Math.max(0, bossHpRef.current / phase.maxHp);
  const playerRatio = Math.max(0, playerHpRef.current / PLAYER_MAX_HP);
  const shieldActive = shieldUntilRef.current > t0;
  const rageActive = rageUntilRef.current > t0;
  const banner = bannerRef.current;
  const inc = incantRef.current;
  const incRatio = inc ? Math.max(0, (inc.deadline - t0) / inc.castMs) : 0;

  return (
    <div className={`max-w-2xl w-full ${shake ? 'animate-shake' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-300">
          {t('bossPhase')} <span className="font-bold text-red-300">{phaseIdxRef.current + 1}/{BOSS_PHASES.length}</span>
        </div>
        <button onClick={onQuit} className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          {t('quit')}
        </button>
      </div>

      <div className="mb-1 flex justify-between items-end">
        <span className="text-lg font-extrabold tracking-wide" style={{ color: phase.color }}>{phase.name}</span>
        <span className="text-xs text-gray-400">{Math.max(0, Math.ceil(bossHpRef.current))}/{phase.maxHp}</span>
      </div>
      <div className="w-full h-4 bg-gray-700/70 rounded-full overflow-hidden mb-4 ring-1 ring-white/10">
        <div className="h-full transition-all duration-100 rounded-full"
          style={{ width: `${bossRatio * 100}%`, background: `linear-gradient(90deg, ${phase.color}, #ef4444)` }} />
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 ring-1 ring-red-500/40 select-none"
        style={{ height: '46vh', minHeight: 300 }}>
        <div className={`absolute left-1/2 -translate-x-1/2 transition-transform ${bossHitFlash ? 'scale-95' : 'scale-100'}`}
          style={{ top: '4%' }}>
          <div className="text-6xl" style={{ filter: bossHitFlash ? 'brightness(2)' : 'none' }}>👹</div>
        </div>

        {/* Projectiles */}
        {projsRef.current.map((p) => {
          if (p.dead) return null;
          const launched = !(p.kind === 'boss' && p.born > t0);
          const top = p.kind === 'player'
            ? 84 - Math.min(1, (t0 - p.born) / p.ttl) * 70
            : bossProjTop(p, t0);
          const left = 50 + p.lane * 30;
          const armored = p.maxHp > 1;
          const cracked = armored && p.hp < p.maxHp;
          return (
            <div key={p.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-sm font-bold whitespace-nowrap ${launched ? '' : 'opacity-60 animate-pulse'}`}
              style={{
                top: `${top}%`, left: `${left}%`,
                color: '#fff', background: `${p.color}33`,
                boxShadow: `0 0 14px ${p.color}`,
                border: `${armored ? 2 : 1}px ${cracked ? 'dashed' : 'solid'} ${armored ? '#f59e0b' : p.color}`,
              }}>
              {p.kind === 'player' ? '✦ ' : armored ? '🛡'.repeat(p.hp) + ' ' : ''}{p.word}
            </div>
          );
        })}

        {/* FX */}
        {fxRef.current.map((f) => {
          if (f.type === 'break') {
            return <div key={f.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl boss-break"
              style={{ top: `${f.top}%`, left: `${f.left}%`, color: f.color }}>✸</div>;
          }
          if (f.type === 'crack') {
            return <div key={f.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-lg boss-break"
              style={{ top: `${f.top}%`, left: `${f.left}%`, color: f.color }}>🛡✦</div>;
          }
          return <div key={f.id} className="absolute -translate-x-1/2 text-sm font-extrabold boss-float"
            style={{ top: `${f.top}%`, left: `${f.left}%`, color: f.color }}>{f.text}</div>;
        })}

        {/* Incantation (coup fatal à contrer) */}
        {inc && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-red-900/20">
            <div className="text-xs uppercase tracking-widest text-red-300 mb-1 animate-pulse">{t('bossIncantWarn')}</div>
            <div className="text-4xl font-extrabold tracking-wider mb-3 boss-incant"
              style={{ color: '#fca5a5', textShadow: '0 0 18px rgba(239,68,68,0.8)' }}>{inc.word}</div>
            <div className="w-56 h-2 bg-gray-800 rounded-full overflow-hidden ring-1 ring-red-500/50">
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${incRatio * 100}%` }} />
            </div>
          </div>
        )}

        {banner && !inc && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 boss-banner">
              {banner.text}
            </div>
          </div>
        )}

        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '4%' }}>
          <div className="text-5xl relative">
            🧙
            {shieldActive && (
              <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-70 boss-shield">🛡️</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 mb-1 flex justify-between items-end">
        <span className="text-sm font-bold text-green-300">
          {t('bossYou')} {rageActive && <span className="text-orange-400">⚡{t('bossRage')}</span>}
        </span>
        <span className="text-xs text-gray-400">{Math.max(0, Math.ceil(playerHpRef.current))}/{PLAYER_MAX_HP}</span>
      </div>
      <div className="w-full h-4 bg-gray-700/70 rounded-full overflow-hidden mb-4 ring-1 ring-white/10">
        <div className="h-full transition-all duration-100 rounded-full"
          style={{ width: `${playerRatio * 100}%`, background: playerRatio > 0.3 ? 'linear-gradient(90deg,#22c55e,#84cc16)' : '#ef4444' }} />
      </div>

      <input
        ref={inputElRef}
        type="text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={inc ? t('bossIncantWarn') : t('bossTypePlaceholder')}
        className={`w-full bg-gray-700 text-center text-xl py-3 px-6 rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-gray-600 mb-4 ${inc ? 'ring-2 ring-red-500 animate-pulse' : 'focus:ring-red-500'}`}
      />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {deck.map((e) => {
          const until = cooldownsRef.current[e.card.id] ?? 0;
          const remaining = Math.max(0, until - t0);
          const ratio = remaining > 0 ? remaining / e.card.cooldownMs : 0;
          const color = RARITY_COLOR[e.card.rarity];
          return (
            <div key={e.card.id}
              className="relative rounded-lg p-2 text-center overflow-hidden bg-gray-800 ring-1"
              style={{ borderColor: color, boxShadow: ratio > 0 ? 'none' : `0 0 10px ${color}55`, ['--tw-ring-color' as string]: `${color}66` }}>
              <div className="absolute inset-x-0 bottom-0 bg-black/70 transition-all" style={{ height: `${ratio * 100}%` }} />
              <div className="relative">
                <div className="text-sm font-bold truncate" style={{ color }}>{e.card.word}</div>
                <div className="text-[10px] text-gray-400">
                  {e.card.kind === 'attack' && `⚔ ${cardDamage(e.card, e.level)}`}
                  {e.card.kind === 'defense' && (e.card.defense === 'shield' ? '🛡' : '✋')}
                  {e.card.kind === 'spell' && (e.card.spell === 'heal' ? `✚ ${cardHeal(e.card, e.level)}` : '⚡')}
                  {remaining > 0 && <span className="ml-1 text-red-300">{(remaining / 1000).toFixed(1)}s</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BossArena;
