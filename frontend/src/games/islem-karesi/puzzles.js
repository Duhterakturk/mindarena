import { generateLatinSquare } from "../common/latinSquare";
import { buildCageData } from "../common/cages";
import { countCages } from "../common/solvers";

// İşlem Karesi (Calcudoku/KenKen), yalnızca toplama/çarpma kafesleriyle
// (her zaman geçerli hedef üretir). Zorluk, ızgara boyutuyla ölçeklenir.
const GRID_SIZE_BY_DIFFICULTY = { easy: 4, medium: 6, hard: 8 };
const ALLOWED_OPS = ["+", "×"];

export function generate(difficulty = "easy") {
  const n = GRID_SIZE_BY_DIFFICULTY[difficulty] || 4;
  for (let attempt = 0; attempt < 40; attempt++) {
    const solution = generateLatinSquare(n);
    const puzzle = solution.map((row) => row.map(() => 0));
    const cages = buildCageData(n, solution, ALLOWED_OPS);
    if (countCages(puzzle, cages.cageId, cages.cageClues) === 1) {
      return { puzzle, solution, ...cages };
    }
  }
  throw new Error("Tek çözüm İşlem Karesi üretilemedi");
}
