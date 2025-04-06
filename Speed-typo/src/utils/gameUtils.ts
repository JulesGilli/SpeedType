// Word list
const words = ["apple", "banana", "cherry", "dragon", "elephant", "forest", "guitar", "holiday", "igloo", "jungle", "kitchen", "lemon", "mountain", "number", "orange", "purple", "quality", "rainbow", "summer", "turtle", "umbrella", "victory", "window", "xylophone", "yellow", "zebra", "computer", "keyboard", "monitor", "internet", "coding", "developer", "software", "hardware", "program", "algorithm", "function", "variable", "constant", "boolean", "string", "integer", "array", "object", "method", "property", "class", "interface"];
// Get a random word from the word list
export const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};
// Replace letters with numbers or reverse the word
export const modifyWord = word => {
  const originalWord = word;
  const modificationTypes = ["number", "reverse", "none"];
  const randomType = modificationTypes[Math.floor(Math.random() * modificationTypes.length)];
  if (randomType === "number") {
    let modified = word;
    // Replace some letters with numbers
    const replacements = {
      'a': '4',
      'e': '3',
      'i': '1',
      'o': '0',
      's': '5',
      't': '7'
    };
    // Replace at least one letter if possible
    let hasReplacement = false;
    for (const [letter, number] of Object.entries(replacements)) {
      if (modified.includes(letter)) {
        // 70% chance to replace each occurrence
        if (Math.random() < 0.7) {
          modified = modified.replace(letter, number);
          hasReplacement = true;
        }
      }
    }
    // If no replacements were made and the word contains replaceable letters, force at least one
    if (!hasReplacement) {
      for (const [letter, number] of Object.entries(replacements)) {
        if (modified.includes(letter)) {
          modified = modified.replace(letter, number);
          break;
        }
      }
    }
    return {
      modified,
      originalWord
    };
  } else if (randomType === "reverse") {
    const modified = word.split('').reverse().join('');
    return {
      modified,
      originalWord
    };
  } else {
    return {
      modified: word,
      originalWord
    };
  }
};
// Calculate score based on word length, time taken, and combo
export const calculateScore = (wordLength, timeTaken, comboCount) => {
  // Base score: longer words = more points
  let baseScore = wordLength * 5;
  // Speed bonus: faster typing = more points
  const speedMultiplier = Math.max(0.5, Math.min(3, 5 / Math.max(1, timeTaken)));
  // Combo multiplier
  const comboMultiplier = 1 + comboCount * 0.1;
  // Calculate final score
  const finalScore = Math.round(baseScore * speedMultiplier * comboMultiplier);
  return finalScore;
};