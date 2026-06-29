import { GameMode } from '../types/GameMode';

// Pool commun (brainrot / gaming), partagé par tous les modes.
const COMMON_WORDS = [
  "skibidi toilet", "gyatt", "sigma grindset", "rizz god", "no cap", "sheesh", "ok boomer",
  "among us", "sussy baka", "yeet", "giga chad", "emotional damage", "you fell off", "it's corn",
  "i'm him", "goofy ahh", "ohio final boss", "griddy", "npc moment", "caught in 4k", "based",
  "cringe", "ratio", "beluga", "meme lord", "sigma male", "skrrt", "bussin", "fr fr", "mid",
  "gg ez", "touch grass", "main character", "glow up", "sus", "drip", "slay", "vibe check",
  "rent free", "built different", "menace", "aura points", "negative aura", "mewing", "looksmaxxing",
  "brainrot", "delulu", "mogging", "fanum tax", "baby gronk", "kai cenat", "duke dennis",
  "grimace shake", "quandale dingle", "waffle house", "let him cook", "ratioed", "gyatt rizz",
];

// Mots spécifiques à chaque mode, pour varier le ressenti d'un mode à l'autre.
const MODE_WORDS: Record<GameMode, string[]> = {
  classique: [
    "speedrun", "clutch play", "headshot", "victory royale", "wombo combo", "critical hit",
    "boss fight", "loot drop", "respawn point", "power up", "combo breaker", "final boss",
    "easter egg", "cheat code", "high score", "no scope", "ultra kill", "first blood",
  ],
  leet: [
    "elite hacker", "leet speak", "aimbot", "sudo access", "root exploit", "data breach",
    "stack trace", "null pointer", "segfault", "kernel panic", "ascii art", "binary tree",
    "trojan horse", "buffer overflow", "zero cool", "matrix code",
  ],
  inversé: [
    "monde", "clavier", "vitesse", "cosmos", "galaxie", "pixel", "ninja", "dragon", "matrix",
    "turbo", "laser", "prisme", "vortex", "photon", "quantum", "nebula",
  ],
  memoire: [
    "chat", "pizza", "robot", "tigre", "nuage", "flamme", "ombre", "givre", "metal", "piano",
    "cobra", "venin", "jade", "onyx", "echo", "lynx",
  ],
  blind: [
    "bonjour", "merci", "clavier", "souris", "fenetre", "ananas", "banane", "orange", "cerise",
    "fraise", "carotte", "tomate", "salade", "fromage", "baguette", "lumiere",
  ],
  endless: [], // le mode endless utilise ses propres phrases
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Sac mélangé par mode : on épuise tout le pool avant de répéter un mot.
const bags: Partial<Record<GameMode, string[]>> = {};

// Tire un mot pour un mode donné, sans répétition tant que le pool n'est pas épuisé.
// Accepte aussi les modes hardcore (chaos/sudden) -> pool commun.
export const getRandomWord = (mode: string = 'classique') => {
  let bag = bags[mode as GameMode];
  if (!bag || bag.length === 0) {
    bag = shuffle([...COMMON_WORDS, ...(MODE_WORDS[mode as GameMode] ?? [])]);
    bags[mode as GameMode] = bag;
  }
  return bag.pop() as string;
};
// Replace letters with numbers or reverse the word
export const modifyWord = (
  word: string,
  includeNumbers = true,
  reverseWords = true
): {
  modified: string;
  originalWord: string;
  isLeet: boolean;
  isReversed: boolean;
} => {
  const originalWord = word;

  const types: string[] = [];
  if (includeNumbers) types.push("number");
  if (reverseWords) types.push("reverse");
  types.push("none");

  const randomType = types[Math.floor(Math.random() * types.length)];

  if (randomType === "number") {
    let modified = word;
    let isLeet = false;
    const replacements: Record<string, string> = {
      'a': '4',
      'e': '3',
      'i': '1',
      'o': '0',
      's': '5',
      't': '7'
    };
    for (const [letter, number] of Object.entries(replacements)) {
      if (modified.includes(letter) && Math.random() < 0.7) {
        modified = modified.replace(letter, number);
        isLeet = true;
      }
    }
    return { modified, originalWord, isLeet, isReversed: false };
  }

  if (randomType === "reverse") {
    const modified = word.split('').reverse().join('');
    return { modified, originalWord, isLeet: false, isReversed: true };
  }

  return { modified: word, originalWord, isLeet: false, isReversed: false };
};


// Mots par minute : convention standard = (caractères corrects / 5) / minutes.
export const computeWpm = (correctChars: number, durationSec: number) => {
  const minutes = durationSec / 60;
  if (minutes <= 0) return 0;
  return Math.round((correctChars / 5) / minutes);
};

// Calculate score based on word length, time taken, and combo
export const calculateScore = (
  wordLength: number,
  timeTaken: number,
  comboCount: number,
  isLeet: boolean = false,
  isReversed: boolean = false
) => {
  let baseScore = wordLength * 5;

  // Vitesse
  const speedMultiplier = Math.max(0.5, Math.min(3, 5 / Math.max(1, timeTaken)));

  // Combo
  const comboMultiplier = 1 + comboCount * 0.1;

  // Bonus si le mot est modifié
  const leetBonus = isLeet ? 1.4 : 1;        // +40% si le mot a des chiffres
  const reverseBonus = isReversed ? 1.4 : 1; // +40% si le mot est inversé

  const finalScore = Math.round(
    baseScore * speedMultiplier * comboMultiplier * leetBonus * reverseBonus
  );

  return finalScore;
};
