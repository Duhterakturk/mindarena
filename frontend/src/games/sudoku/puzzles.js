import { generateSudokuSolution, shuffle } from "../common/latinSquare";
import { countSudoku } from "../common/solvers";

const GIVEN_BAND = {
  easy: [36, 42],
  medium: [30, 35],
  hard: [24, 29],
};

function givenCount(grid) {
  return grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
}

export function generate(difficulty = "easy") {
  const [minGiven, maxGiven] = GIVEN_BAND[difficulty] || GIVEN_BAND.easy;
  for (let attempt = 0; attempt < 12; attempt++) {
    const solution = generateSudokuSolution();
    const puzzle = solution.map((row) => [...row]);
    const cells = shuffle(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
    );
    for (const [r, c] of cells) {
      if (givenCount(puzzle) <= minGiven) break;
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;
      if (countSudoku(puzzle) !== 1) puzzle[r][c] = backup;
    }
    const givens = givenCount(puzzle);
    if (givens >= minGiven && givens <= maxGiven && countSudoku(puzzle) === 1) {
      return { puzzle, solution };
    }
  }
  throw new Error("Tek çözüm Rakam Karesi üretilemedi");
}

export { GIVEN_BAND };
