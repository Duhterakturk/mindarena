import { shuffle } from "../common/latinSquare";

// Yazı Rengi: kelime başka bir renkte yazılır. Doğru cevap mürekkep rengidir.
export const COLOR_IDS = ["red", "blue", "green", "yellow"];

export const COLOR_HEX = {
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#ca8a04",
};

const ROUND_COUNT_BY_DIFFICULTY = { easy: 6, medium: 10, hard: 14 };

export function generateRounds(difficulty = "easy") {
  const count = ROUND_COUNT_BY_DIFFICULTY[difficulty] || ROUND_COUNT_BY_DIFFICULTY.easy;
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const [wordId, inkId] = shuffle([...COLOR_IDS]).slice(0, 2);
    rounds.push({ wordId, inkId });
  }
  return rounds;
}
