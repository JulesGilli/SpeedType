// Rangs attribués selon le score global (somme des meilleurs scores par mode).
// Seuils ajustables : si la communauté progresse, on relève les paliers ici.

export interface Tier {
  key: string;   // clé i18n : tier_<key>
  min: number;   // score global minimum pour atteindre ce palier
  color: string; // couleur du badge
}

export const TIERS: Tier[] = [
  { key: 'bronze', min: 0, color: '#cd7f32' },
  { key: 'silver', min: 2000, color: '#cbd5e1' },
  { key: 'gold', min: 6000, color: '#facc15' },
  { key: 'platinum', min: 12000, color: '#5eead4' },
  { key: 'diamond', min: 20000, color: '#a78bfa' },
  { key: 'master', min: 32000, color: '#f472b6' },
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
