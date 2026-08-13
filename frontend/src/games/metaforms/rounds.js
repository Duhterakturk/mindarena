import { shuffle } from "../common/latinSquare";

const SHAPES = ["circle", "square", "triangle", "diamond"];

const CONFIG = {
  easy: { rounds: 4, shapesPerRound: 4 },
  medium: { rounds: 6, shapesPerRound: 6 },
  hard: { rounds: 8, shapesPerRound: 9 },
};

// Her turda N şekilden biri diğerlerinden farklıdır; öğrenci farklı olanı
// bulmalıdır. Zorluk, tur sayısı ve tur başına şekil sayısıyla ölçeklenir
// (daha çok şekil arasında farklı olanı bulmak daha zordur).
export function generateRounds(difficulty = "easy") {
  const { rounds: roundCount, shapesPerRound } = CONFIG[difficulty] || CONFIG.easy;
  const rounds = [];
  for (let i = 0; i < roundCount; i++) {
    const [majority, minority] = shuffle(SHAPES).slice(0, 2);
    const oddIndex = Math.floor(Math.random() * shapesPerRound);
    const shapes = Array.from({ length: shapesPerRound }, (_, idx) => (idx === oddIndex ? minority : majority));
    rounds.push({ shapes, oddIndex });
  }
  return rounds;
}
