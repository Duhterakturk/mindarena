import { generateLatinSquare } from "../common/latinSquare";
import { buildCageData } from "../common/cages";

// İşlem Karesi (Calcudoku/KenKen), yalnızca toplama/çarpma kafesleriyle
// (her zaman geçerli hedef üretir). Zorluk, ızgara boyutuyla ölçeklenir.
const GRID_SIZE_BY_DIFFICULTY = { easy: 4, medium: 6, hard: 8 };
const ALLOWED_OPS = ["+", "×"];

export function generate(difficulty = "easy") {
  const n = GRID_SIZE_BY_DIFFICULTY[difficulty] || 4;
  const solution = generateLatinSquare(n);
  const puzzle = solution.map((row) => row.map(() => 0));
  const { cageId, cageAnchor, cageCells, cageClues } = buildCageData(n, solution, ALLOWED_OPS);

  return { puzzle, solution, cageId, cageAnchor, cageCells, cageClues };
}
