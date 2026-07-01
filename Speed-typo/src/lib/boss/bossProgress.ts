// ---------------------------------------------------------------------------
// Mode Boss Battle — progression persistée en localStorage.
// Or, cartes possédées (avec niveau), deck équipé. Indépendant du backend :
// cette progression est locale au navigateur (comme st_bg_enabled / st_lang).
// ---------------------------------------------------------------------------
import {
  STARTER_DECK,
  MAX_DECK,
  CARD_BY_ID,
  rollBoosterCard,
  UPGRADE_COST,
  upgradesForLevel,
  BOOSTER_COST,
  CardDef,
} from './bossData';

const KEY = 'st_boss_progress';
const START_GOLD = 150;

export interface OwnedCard {
  level: number;
  progress: number; // améliorations accumulées vers le niveau suivant
}

// Applique une amélioration (achat OU doublon) : +1 progression, et monte de
// niveau quand on atteint le nombre requis (= niveau courant).
const applyUpgrade = (o: OwnedCard): OwnedCard => {
  let level = o.level;
  let progress = o.progress + 1;
  if (progress >= upgradesForLevel(level)) {
    progress -= upgradesForLevel(level);
    level += 1;
  }
  return { level, progress };
};

export interface BossProgress {
  gold: number;
  owned: Record<string, OwnedCard>;
  deck: string[]; // ids équipés (ordre = ordre d'affichage)
  bestPhase: number; // meilleure phase atteinte (0 = jamais joué)
}

const defaultProgress = (): BossProgress => {
  const owned: Record<string, OwnedCard> = {};
  for (const id of STARTER_DECK) owned[id] = { level: 1, progress: 0 };
  return { gold: START_GOLD, owned, deck: [...STARTER_DECK], bestPhase: 0 };
};

export const loadProgress = (): BossProgress => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw) as BossProgress;
    // Garde-fous : on filtre les ids inconnus (catalogue qui a pu changer).
    const owned: Record<string, OwnedCard> = {};
    for (const [id, v] of Object.entries(p.owned ?? {})) {
      if (CARD_BY_ID[id]) owned[id] = { level: Math.max(1, v.level | 0), progress: Math.max(0, v.progress | 0) };
    }
    if (Object.keys(owned).length === 0) return defaultProgress();
    const deck = (p.deck ?? []).filter((id) => owned[id]).slice(0, MAX_DECK);
    return {
      gold: Math.max(0, p.gold | 0),
      owned,
      deck: deck.length ? deck : Object.keys(owned).slice(0, MAX_DECK),
      bestPhase: Math.max(0, p.bestPhase | 0),
    };
  } catch {
    return defaultProgress();
  }
};

// Met à jour la meilleure phase atteinte (ne redescend jamais).
export const recordBestPhase = (p: BossProgress, reached: number): BossProgress =>
  reached > p.bestPhase ? { ...p, bestPhase: reached } : p;

export const saveProgress = (p: BossProgress) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* quota / mode privé : on ignore */
  }
};

// Les cartes équipées, résolues en définitions complètes (+ niveau).
export const deckCards = (p: BossProgress): { card: CardDef; level: number }[] =>
  p.deck
    .map((id) => (CARD_BY_ID[id] ? { card: CARD_BY_ID[id], level: p.owned[id]?.level ?? 1 } : null))
    .filter((x): x is { card: CardDef; level: number } => x !== null);

// Équipe / retire une carte du deck. Renvoie une nouvelle progression.
export const toggleEquip = (p: BossProgress, id: string): BossProgress => {
  if (!p.owned[id]) return p;
  if (p.deck.includes(id)) {
    return { ...p, deck: p.deck.filter((d) => d !== id) };
  }
  if (p.deck.length >= MAX_DECK) return p; // deck plein
  return { ...p, deck: [...p.deck, id] };
};

// Achète une amélioration (coût fixe). +1 progression, montée de niveau auto.
export const upgrade = (p: BossProgress, id: string): { progress: BossProgress; ok: boolean } => {
  const o = p.owned[id];
  if (!o) return { progress: p, ok: false };
  if (p.gold < UPGRADE_COST) return { progress: p, ok: false };
  return {
    progress: {
      ...p,
      gold: p.gold - UPGRADE_COST,
      owned: { ...p.owned, [id]: applyUpgrade(o) },
    },
    ok: true,
  };
};

// Ouvre un booster (consomme de l'or). Renvoie la carte tirée + si elle est nouvelle.
export const openBooster = (
  p: BossProgress
): { progress: BossProgress; card: CardDef | null; isNew: boolean } => {
  if (p.gold < BOOSTER_COST) return { progress: p, card: null, isNew: false };
  const card = rollBoosterCard();
  const existing = p.owned[card.id];
  const isNew = !existing;
  const owned = { ...p.owned };
  // Doublon = une amélioration gratuite ; nouvelle carte = niveau 1.
  owned[card.id] = existing ? applyUpgrade(existing) : { level: 1, progress: 0 };
  let deck = p.deck;
  // Carte inédite : on l'équipe automatiquement s'il reste de la place.
  if (isNew && deck.length < MAX_DECK) deck = [...deck, card.id];
  return { progress: { ...p, gold: p.gold - BOOSTER_COST, owned, deck }, card, isNew };
};

export const addGold = (p: BossProgress, amount: number): BossProgress => ({
  ...p,
  gold: Math.max(0, p.gold + amount),
});
