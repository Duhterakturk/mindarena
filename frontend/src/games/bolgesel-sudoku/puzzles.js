import { relabelGrid, carvePuzzle } from "../common/latinSquare";
import { countRegionLatin } from "../common/solvers";

// 4x4 Bölge Karesi. Bölge şekli sabittir; yalnız tek çözümlü bulmacalar döner.
export const BASE_SOLUTION = [
  [1, 2, 3, 4],
  [2, 4, 1, 3],
  [3, 1, 4, 2],
  [4, 3, 2, 1],
];

// Her hücrenin ait olduğu bölge (A/B/C/D)
export const REGIONS = [
  ["A", "A", "A", "B"],
  ["C", "A", "B", "B"],
  ["C", "C", "D", "B"],
  ["C", "D", "D", "D"],
];

export const GIVENS_BY_DIFFICULTY = { easy: 8, medium: 6, hard: 4 };

export function generate(difficulty = "easy") {
  const givens = GIVENS_BY_DIFFICULTY[difficulty] || GIVENS_BY_DIFFICULTY.easy;
  for (let attempt = 0; attempt < 40; attempt++) {
    const solution = relabelGrid(BASE_SOLUTION, 4);
    const puzzle = carvePuzzle(solution, givens);
    if (countRegionLatin(puzzle, REGIONS) === 1) return { puzzle, solution };
  }
  throw new Error("Tek çözüm Bölge Karesi üretilemedi");
}
