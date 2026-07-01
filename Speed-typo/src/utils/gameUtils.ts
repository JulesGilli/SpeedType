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
  // Gaming
  "clutch", "hard carry", "feeding", "tilted", "smurf", "cracked", "goated", "one tap",
  "quickscope", "bunny hop", "wallbang", "teabag", "pentakill", "reverse sweep", "meta slave", "sweaty",
  "tryhard", "skill issue", "get good", "rage quit", "lag switch", "ping diff", "parry this", "no hit run",
  "frame perfect", "backseat gamer", "jungle diff", "hard stuck", "elo hell", "free kill", "outplayed", "outskilled",
  "insane clip", "highlight reel", "clip it", "gg go next", "one shot", "double kill", "triple kill", "match point",
  // Réactions / emotes
  "poggers", "pog", "kekw", "copium", "hopium", "sadge", "malding", "cope harder",
  "seethe", "mald", "big brain", "smooth brain", "galaxy brain", "small brain", "stonks", "not stonks",
  "bruh moment", "big oof", "big yikes", "cursed", "blessed", "who asked", "nobody asked", "didn't ask",
  "this you", "task failed successfully", "visible confusion", "surprised pikachu", "bonk", "monke",
  // Rizz / brainrot
  "rizzler", "w rizz", "l rizz", "unspoken rizz", "costco guy", "chill guy", "crash out", "crashing out",
  "he's cooking", "chef kiss", "we're so back", "it's so over", "so joever", "sending me", "glazing", "glaze",
  "yapping", "yapper", "big yapper", "terminally online", "chronically online", "canon event", "plot armor", "character arc",
  "lore accurate", "side quest", "main quest", "final boss energy", "npc behavior", "background character", "aura farming", "plus aura",
  "certified", "peak fiction", "absolute cinema", "he is him", "so real", "too real", "felt that", "it's giving",
  // Slang / punchlines
  "understood the assignment", "ate that", "no crumbs", "iconic", "legendary", "goated with the sauce", "sauce", "saucy",
  "washed", "down bad", "down horrendous", "locked in", "lock in", "secure the bag", "in my bag", "big bag",
  "money bag", "valid", "big facts", "straight up", "deadass", "on god", "lowkey", "highkey",
  "no shot", "real ones", "say less", "bet", "sending it", "gyatt damn", "hard in the paint", "cold",
  "ice cold", "goated take", "hot take", "mid take", "based take", "npc take", "clown take", "certified banger",
  // Classiques du net
  "return to monke", "reject humanity", "stop the cap", "cap detected", "cappin", "and i took that personally", "let them cook", "kitchen closed",
  "he cooked", "she cooked", "they cooked", "burnt the food", "undercooked", "raw", "hold this l", "take this w",
  "you dropped this king", "impostor", "emergency meeting", "self report", "kinda sus", "mega sus", "vented", "creeper aw man",
  "herobrine", "minecraft steve", "reverse card", "uno reverse", "gg wp", "ez clap", "throwing", "int diff",
  "hard diff", "map diff", "team diff",
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

// Mots courts (≤ 6 lettres) pour les bonus du mode Blitz : doivent rester rapides à taper.
const SHORT_WORDS = [
  'rizz', 'sus', 'npc', 'yeet', 'based', 'drip', 'goat', 'aura', 'sigma', 'noob',
  'epic', 'mid', 'cap', 'combo', 'turbo', 'laser', 'pixel', 'ninja', 'cobra', 'jade',
  'onyx', 'echo', 'metal', 'vibe', 'slay', 'flex', 'grind', 'meme', 'boss', 'loot',
  'spawn', 'frag', 'clutch', 'gyatt', 'sheesh', 'chad', 'op', 'gg', 'ez', 'lag',
  'buff', 'nerf', 'tank', 'heal', 'crit', 'ping', 'spam', 'troll', 'quest', 'mage',
  'rogue', 'glow', 'cope', 'mald', 'huzz', 'fanum', 'gworm',
];

// Tire un mot court au hasard (bonus Blitz).
export const getShortWord = () => SHORT_WORDS[Math.floor(Math.random() * SHORT_WORDS.length)];

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
