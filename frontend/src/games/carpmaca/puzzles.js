import { shuffle } from "../common/latinSquare";

// Çarpmaca: küçük bir çarpım tablosu. Zorluk; ızgara boyutu, sayı aralığı ve
// verilen (given) hücre sayısıyla ölçeklenir.
const CONFIG = {
  easy: { size: 4, min: 2, max: 5, givens: 4 },
  medium: { size: 4, min: 2, max: 9, givens: 2 },
  hard: { size: 5, min: 2, max: 12, givens: 0 },
};

export function generate(difficulty = "easy") {
  const { size, min, max, givens } = CONFIG[difficulty] || CONFIG.easy;
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const rowHeaders = shuffle(pool).slice(0, size);
  const colHeaders = shuffle(pool).slice(0, size);

  const solution = rowHeaders.map((rh) => colHeaders.map((ch) => rh * ch));

  const allCells = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) allCells.push([r, c]);
  const givenCells = new Set(shuffle(allCells).slice(0, givens).map(([r, c]) => `${r}-${c}`));
  const puzzle = solution.map((row, r) => row.map((val, c) => (givenCells.has(`${r}-${c}`) ? val : 0)));

  return { rowHeaders, colHeaders, puzzle, solution };
}
