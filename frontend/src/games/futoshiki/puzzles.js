import { shuffle, generateLatinSquare, carvePuzzle } from "../common/latinSquare";

// Futoshiki: ızgara boyutu, ipucu (eşitsizlik işareti) sayısı ve verilen
// hücre sayısı zorlukla ölçeklenir. Daha büyük ızgara + daha az ipucu/verilen
// hücre = daha zor.
const CONFIG = {
  easy: { size: 4, givens: 6, hints: 6 },
  medium: { size: 5, givens: 6, hints: 5 },
  hard: { size: 6, givens: 5, hints: 4 },
};

function randomHintPositions(n, count) {
  const allHorizontal = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n - 1; c++) allHorizontal.push({ r, c, type: "h" });
  }
  const allVertical = [];
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n; c++) allVertical.push({ r, c, type: "v" });
  }
  const all = shuffle([...allHorizontal, ...allVertical]).slice(0, count);
  return {
    horizontal: all.filter((p) => p.type === "h"),
    vertical: all.filter((p) => p.type === "v"),
  };
}

export function generate(difficulty = "easy") {
  const { size, givens, hints } = CONFIG[difficulty] || CONFIG.easy;
  const solution = generateLatinSquare(size);
  const puzzle = carvePuzzle(solution, givens);
  const { horizontal, vertical } = randomHintPositions(size, hints);
  return { puzzle, solution, horizontal, vertical, size };
}
