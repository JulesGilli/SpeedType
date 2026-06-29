// Rangs attribués selon le score global (somme des meilleurs scores par mode).
// Seuils ajustables : si la communauté progresse, on relève les paliers ici.

export interface Tier {
  key: string;   // clé i18n : tier_<key>
  min: number;   // score global minimum pour atteindre ce palier
  color: string; // couleur du badge
}

export const TIERS: Tier[] = [
  { key: 'bronze', min: 0, color: '#cd7f32' },
  { key: 'silver', min: 18000, color: '#cbd5e1' },
  { key: 'gold', min: 22000, color: '#facc15' },
  { key: 'diamond', min: 26000, color: '#a78bfa' },
  { key: 'master', min: 30000, color: '#f472b6' },
  { key: 'grandmaster', min: 42000, color: '#ef4444' },
  { key: 'divin', min: 50000, color: '#7dd3fc' },
];

// Palier courant (le plus haut dont le seuil est atteint).
export function getTier(score: number): Tier {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (score >= tier.min) current = tier;
  }
  return current;
}

// Palier suivant (null si déjà au sommet) — utile pour une barre de progression.
export function nextTier(score: number): Tier | null {
  return TIERS.find((tier) => tier.min > score) ?? null;
}

// Le mode Hardcore se débloque au rang Master.
export const HARDCORE_MIN = TIERS.find((t) => t.key === 'master')?.min ?? Infinity;
export const isHardcoreUnlocked = (globalScore: number) => globalScore >= HARDCORE_MIN;
