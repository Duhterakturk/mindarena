import { generateLatinSquare, carvePuzzle } from "../common/latinSquare";
import { countLatin } from "../common/solvers";

// 4x4 Apartman. Kenar ipuçları her oynanışta yeni bir Latin kareden hesaplanır.
// Yalnızca tek çözümü olan bulmacalar döner.
export const GIVENS_BY_DIFFICULTY = { easy: 8, medium: 5, hard: 3 };

function visibleCount(sequence) {
  let count = 0;
  let tallest = 0;
  for (const height of sequence) {
    if (height > tallest) {
      count++;
      tallest = height;
    }
  }
  return count;
}

export function computeClues(solution) {
  const n = solution.length;
  const top = [];
  const bottom = [];
  for (let c = 0; c < n; c++) {
    const col = solution.map((row) => row[c]);
    top.push(visibleCount(col));
    bottom.push(visibleCount([...col].reverse()));
  }
  const left = solution.map((row) => visibleCount(row));
  const right = solution.map((row) => visibleCount([...row].reverse()));
  return { top, bottom, left, right };
}

function respects(grid, clues) {
  const n = grid.length;
  const again = computeClues(grid);
  return ["top", "bottom", "left", "right"].every((side) =>
    again[side].every((value, i) => value === clues[side][i])
  ) && grid.length === n;
}

export function generate(difficulty = "easy") {
  const givens = GIVENS_BY_DIFFICULTY[difficulty] || GIVENS_BY_DIFFICULTY.easy;
  for (let attempt = 0; attempt < 60; attempt++) {
    const solution = generateLatinSquare(4);
    const puzzle = carvePuzzle(solution, givens);
    const clues = computeClues(solution);
    if (countLatin(puzzle, 2, (grid) => respects(grid, clues)) === 1) {
      return { puzzle, solution, clues };
    }
  }
  throw new Error("Tek çözüm Apartman üretilemedi");
}
