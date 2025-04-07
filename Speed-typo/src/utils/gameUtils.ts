// Word list
const words = [
  "skibidi toilet", "gyatt", "sigma grindset", "rizz god", "cap or no cap", "sheesh", "ok boomer",
  "deez nuts", "ligma balls", "among us", "sussy baka", "skrrt skrrt", "yeet", "chad", "giga chad",
  "emotional damage", "waffle house", "you fell off", "it's corn", "i'm him", "goofy ahh", "ohio final boss",
  "griddy", "npc moment", "caught in 4k", "based", "cringe", "ratio", "beluga", "meme lord", "me when",
  "i'm a bird", "tiktok toe", "bouba", "dababy", "yo mama", "tiktok voice", "sigma male", "average fan",

  "leeroy jenkins", "hadouken", "finish him", "fatality", "arrow to the knee", "ultra kill",
  "get over here", "do a barrel roll", "it's a me", "the cake is a lie", "press f", "headshot",
  "ez pz", "git gud", "dark souls", "bonfire lit", "respawn", "critical hit", "boom headshot",
  "sniper gang", "360 no scope", "loot goblin", "red barrel", "noob tube", "pay to win",
  "op pls nerf", "lag switch", "zergling rush", "baby yoda", "victory royale", "build battle",
  "sus impostor", "rez me", "tea bag", "power move", "you died", "let it die", "wall hack",
  "dev mode", "cheat code", "konami code", "boom shakalaka", "gotta go fast", "blue shell"
];

// Get a random word from the word list
export const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
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
