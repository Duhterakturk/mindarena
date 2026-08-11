import { shuffle } from "../common/latinSquare";

const SHAPES = ["circle", "square", "triangle", "diamond"];

// Her turda 4 şekilden biri diğerlerinden farklıdır; öğrenci farklı olanı bulmalıdır.
export function generateRounds(count = 4) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const [majority, minority] = shuffle(SHAPES).slice(0, 2);
    const oddIndex = Math.floor(Math.random() * 4);
    const shapes = Array.from({ length: 4 }, (_, idx) => (idx === oddIndex ? minority : majority));
    rounds.push({ shapes, oddIndex });
  }
  return rounds;
}
