// ---------------------------------------------------------------------------
// Mode Boss Battle — données statiques (catalogue de cartes + phases du boss).
//
// Une "carte" = un mot à taper qui déclenche un effet (attaque / défense / sort).
// Le mot lui-même n'est jamais traduit : c'est ce que le joueur tape littéralement.
// Les libellés/descriptions sont générés dynamiquement (mostly chiffres) pour
// limiter la traduction — voir BossLobby/BossArena + clés i18n `boss*`.
// ---------------------------------------------------------------------------

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardKind = 'attack' | 'defense' | 'spell';

// Comportement précis d'une carte de défense ou de sort.
export type DefenseEffect = 'destroy' | 'shield';
export type SpellEffect = 'heal' | 'rage';

export interface CardDef {
  id: string;
  word: string; // mot à taper (jamais traduit)
  kind: CardKind;
  rarity: Rarity;
  cooldownMs: number;
  // Selon le type :
  damage?: number; // attack
  defense?: DefenseEffect; // defense
  spell?: SpellEffect; // spell
  heal?: number; // spell heal
  durationMs?: number; // spell rage / defense shield
}

// Couleurs par rareté (DA rouge/orange du hardcore + accents par rareté).
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9ca3af', // gris
  rare: '#38bdf8', // cyan
  epic: '#c084fc', // violet
  legendary: '#fbbf24', // or
};

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

// Catalogue complet. Les mots sont volontairement courts et "thématiques".
export const CATALOG: CardDef[] = [
  // --- Attaques ---
  { id: 'choc', word: 'choc', kind: 'attack', rarity: 'common', damage: 7, cooldownMs: 1100 },
  { id: 'frappe', word: 'frappe', kind: 'attack', rarity: 'common', damage: 10, cooldownMs: 1500 },
  { id: 'lame', word: 'lame', kind: 'attack', rarity: 'common', damage: 9, cooldownMs: 1400 },
  { id: 'flamme', word: 'flamme', kind: 'attack', rarity: 'rare', damage: 15, cooldownMs: 2600 },
  { id: 'foudre', word: 'foudre', kind: 'attack', rarity: 'rare', damage: 18, cooldownMs: 3200 },
  { id: 'tempete', word: 'tempete', kind: 'attack', rarity: 'epic', damage: 26, cooldownMs: 4800 },
  { id: 'doom', word: 'doom', kind: 'attack', rarity: 'legendary', damage: 55, cooldownMs: 12000 },

  // --- Défenses ---
  { id: 'parade', word: 'parade', kind: 'defense', rarity: 'common', defense: 'destroy', cooldownMs: 2400 },
  { id: 'esquive', word: 'esquive', kind: 'defense', rarity: 'common', defense: 'destroy', cooldownMs: 2100 },
  { id: 'bouclier', word: 'bouclier', kind: 'defense', rarity: 'rare', defense: 'shield', durationMs: 4000, cooldownMs: 6500 },

  // --- Sorts ---
  { id: 'soin', word: 'soin', kind: 'spell', rarity: 'common', spell: 'heal', heal: 22, cooldownMs: 8000 },
  { id: 'rage', word: 'rage', kind: 'spell', rarity: 'epic', spell: 'rage', durationMs: 6000, cooldownMs: 14000 },
];

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(
  CATALOG.map((c) => [c.id, c])
);

// Deck de départ : un peu d'attaque, de la défense, du soin.
export const STARTER_DECK = ['choc', 'frappe', 'parade', 'esquive', 'soin'];
export const MAX_DECK = 6;

// Multiplicateur de niveau d'une carte (+15 % par niveau au-delà de 1).
export const levelMult = (level: number) => 1 + 0.15 * (level - 1);

export const cardDamage = (card: CardDef, level: number) =>
  Math.round((card.damage ?? 0) * levelMult(level));
export const cardHeal = (card: CardDef, level: number) =>
  Math.round((card.heal ?? 0) * levelMult(level));

// --- Boss : phases successives, chacune avec sa propre barre de vie ---
// Chaque phase a un "pattern" d'attaque distinct qui change la façon de défendre.
export interface BossIncantation {
  everyMs: number; // intervalle entre deux incantations
  castMs: number; // temps laissé au joueur pour taper l'incantation
  damage: number; // dégâts si non contrée (>= PV max => coup fatal)
}

export interface BossPhase {
  name: string; // nom du boss à cette phase (cosmétique, non traduit)
  emoji: string; // visage du boss (change à chaque phase → sensation de boss-rush)
  maxHp: number;
  travelMs: number; // temps qu'un projectile met à atteindre le joueur
  damage: number; // dégâts d'un coup non paré
  color: string;
  goldReward: number; // or gagné en franchissant cette phase
  // Pattern d'attaque :
  salvoSize: number; // nombre de mots par salve (1 = tir simple)
  salvoGapMs: number; // délai entre deux mots d'une même salve
  volleyIntervalMs: number; // délai entre deux salves
  shieldedChance: number; // proba qu'un projectile soit blindé (à parer 2 fois)
  incantation?: BossIncantation; // coup fatal à contrer en tapant une incantation
  regenPerSec?: number; // le boss se régénère (DPS check : il faut burst)
  enrageAtMs?: number; // au bout de ce temps dans la phase, le boss s'enrage
  enrageMult?: number; // multiplicateur d'intervalle une fois enragé (<1 = plus rapide)
}

// 10 phases = un vrai boss-rush. La difficulté monte ET de nouvelles mécaniques
// s'ajoutent progressivement (salves → blindés → incantations → régénération → enrage).
export const BOSS_PHASES: BossPhase[] = [
  // 1 — Tuto : tirs simples.
  { name: 'GLOUBON', emoji: '👹', maxHp: 110, travelMs: 3100, damage: 10, color: '#38bdf8', goldReward: 55,
    salvoSize: 1, salvoGapMs: 0, volleyIntervalMs: 2600, shieldedChance: 0 },
  // 2 — Petites salves.
  { name: 'KRAEL', emoji: '👺', maxHp: 150, travelMs: 2900, damage: 12, color: '#a78bfa', goldReward: 75,
    salvoSize: 2, salvoGapMs: 300, volleyIntervalMs: 3200, shieldedChance: 0.15 },
  // 3 — Premiers blindés.
  { name: 'VIRUX', emoji: '🦠', maxHp: 200, travelMs: 2800, damage: 13, color: '#4ade80', goldReward: 100,
    salvoSize: 3, salvoGapMs: 280, volleyIntervalMs: 3400, shieldedChance: 0.3 },
  // 4 — Salves lourdes, beaucoup de blindés.
  { name: 'SPHINX', emoji: '🗿', maxHp: 260, travelMs: 2700, damage: 15, color: '#f59e0b', goldReward: 130,
    salvoSize: 3, salvoGapMs: 260, volleyIntervalMs: 3200, shieldedChance: 0.4 },
  // 5 — Première incantation fatale (jalon).
  { name: 'MORDRAK', emoji: '🐉', maxHp: 330, travelMs: 2600, damage: 16, color: '#ef4444', goldReward: 190,
    salvoSize: 4, salvoGapMs: 240, volleyIntervalMs: 3600, shieldedChance: 0.35,
    incantation: { everyMs: 12000, castMs: 3600, damage: 999 } },
  // 6 — Régénération : il faut burst.
  { name: 'NECROSS', emoji: '💀', maxHp: 410, travelMs: 2500, damage: 18, color: '#a855f7', goldReward: 210,
    salvoSize: 4, salvoGapMs: 240, volleyIntervalMs: 3400, shieldedChance: 0.4, regenPerSec: 5 },
  // 7 — Enrage : accélère si tu traînes.
  { name: 'TEMPESTA', emoji: '🌪️', maxHp: 500, travelMs: 2400, damage: 19, color: '#22d3ee', goldReward: 250,
    salvoSize: 4, salvoGapMs: 220, volleyIntervalMs: 3200, shieldedChance: 0.4, enrageAtMs: 9000, enrageMult: 0.55 },
  // 8 — Incantations rapprochées + grosses salves blindées.
  { name: 'OBLIVYX', emoji: '🌀', maxHp: 610, travelMs: 2300, damage: 21, color: '#6366f1', goldReward: 305,
    salvoSize: 5, salvoGapMs: 200, volleyIntervalMs: 3400, shieldedChance: 0.45,
    incantation: { everyMs: 10000, castMs: 3300, damage: 999 } },
  // 9 — Régén + enrage + incantation : mur.
  { name: 'VOIDLORD', emoji: '👾', maxHp: 740, travelMs: 2200, damage: 23, color: '#d946ef', goldReward: 370,
    salvoSize: 5, salvoGapMs: 200, volleyIntervalMs: 3200, shieldedChance: 0.45, regenPerSec: 6,
    enrageAtMs: 10000, enrageMult: 0.6, incantation: { everyMs: 11000, castMs: 3300, damage: 999 } },
  // 10 — OMEGA : tout à la fois. Le sommet.
  { name: 'OMEGA', emoji: '🔱', maxHp: 900, travelMs: 2100, damage: 26, color: '#fbbf24', goldReward: 600,
    salvoSize: 6, salvoGapMs: 180, volleyIntervalMs: 3200, shieldedChance: 0.5, regenPerSec: 6,
    enrageAtMs: 9000, enrageMult: 0.55, incantation: { everyMs: 9000, castMs: 3000, damage: 999 } },
];

export const TOTAL_PHASES = BOSS_PHASES.length;
export const WIN_BONUS_GOLD = 500;
export const PLAYER_MAX_HP = 100;

// Or gagné par point de dégât infligé à une phase non terminée (consolation en cas de défaite).
export const GOLD_PER_DAMAGE = 0.5;

// Incantations à taper pour contrer le coup fatal (distinctes des mots de cartes).
export const INCANTATION_WORDS = [
  'extinction', 'cataclysme', 'supernova', 'anathema', 'oblivion', 'apocalypse', 'maelstrom',
];
export const randomIncantation = () =>
  INCANTATION_WORDS[Math.floor(Math.random() * INCANTATION_WORDS.length)];

// Mots affichés sur les projectiles du boss : le joueur peut les TAPER pour
// détruire l'attaque individuellement. Aucun ne doit coïncider avec un mot de
// carte (sinon ambiguïté) — d'où l'absence de 'rage'/'doom' ici.
export const BOSS_ATTACK_WORDS = [
  'crash', 'virus', 'lag', 'glitch', 'hex', 'spam', 'bug', 'wipe', 'void', 'panic',
  'freeze', 'hack', 'curse', 'dread', 'venom', 'sludge', 'toxic', 'decay', 'plague', 'sting',
];
export const randomBossWord = () =>
  BOSS_ATTACK_WORDS[Math.floor(Math.random() * BOSS_ATTACK_WORDS.length)];

// Tire un mot d'attaque en évitant ceux déjà en jeu (frappe individuelle non ambiguë).
export const pickBossWord = (exclude: Set<string>) => {
  const avail = BOSS_ATTACK_WORDS.filter((w) => !exclude.has(w));
  const pool = avail.length ? avail : BOSS_ATTACK_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
};

// --- Économie : boosters ---
export const BOOSTER_COST = 120;
// Coût d'amélioration d'une carte (croît avec le niveau).
export const upgradeCost = (level: number) => 50 * level;

// Probabilités de tirage d'un booster, par rareté.
const BOOSTER_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: 'common', weight: 58 },
  { rarity: 'rare', weight: 28 },
  { rarity: 'epic', weight: 11 },
  { rarity: 'legendary', weight: 3 },
];

// Tire une carte aléatoire pondérée par rareté.
export const rollBoosterCard = (): CardDef => {
  const total = BOOSTER_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  let rarity: Rarity = 'common';
  for (const w of BOOSTER_WEIGHTS) {
    if (r < w.weight) {
      rarity = w.rarity;
      break;
    }
    r -= w.weight;
  }
  const pool = CATALOG.filter((c) => c.rarity === rarity);
  // Repli si une rareté n'a pas de carte (ne devrait pas arriver).
  const list = pool.length ? pool : CATALOG;
  return list[Math.floor(Math.random() * list.length)];
};
