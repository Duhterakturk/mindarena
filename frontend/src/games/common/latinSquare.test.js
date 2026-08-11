import { describe, it, expect } from "vitest";
import {
  generateLatinSquare,
  generateSudokuSolution,
  carvePuzzle,
  relabelGrid,
  computeCageClue,
} from "./latinSquare";

function hasDistinctRowsAndCols(grid, n) {
  for (const row of grid) {
    if (new Set(row).size !== n) return false;
  }
  for (let c = 0; c < n; c++) {
    const col = grid.map((row) => row[c]);
    if (new Set(col).size !== n) return false;
  }
  return true;
}

describe("generateLatinSquare", () => {
  it("produces a valid n x n Latin square across many trials", () => {
    for (let i = 0; i < 200; i++) {
      const grid = generateLatinSquare(4);
      expect(hasDistinctRowsAndCols(grid, 4)).toBe(true);
    }
  });
});

describe("generateSudokuSolution", () => {
  it("produces a valid 9x9 Sudoku (rows, cols, boxes) across many trials", () => {
    for (let i = 0; i < 100; i++) {
      const grid = generateSudokuSolution();
      expect(hasDistinctRowsAndCols(grid, 9)).toBe(true);
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          const box = [];
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              box.push(grid[br * 3 + r][bc * 3 + c]);
            }
          }
          expect(new Set(box).size).toBe(9);
        }
      }
    }
  });
});

describe("carvePuzzle", () => {
  it("keeps exactly keepCount cells and matches the solution where given", () => {
    const solution = generateLatinSquare(4);
    const puzzle = carvePuzzle(solution, 8);
    let givenCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (puzzle[r][c] !== 0) {
          givenCount++;
          expect(puzzle[r][c]).toBe(solution[r][c]);
        }
      }
    }
    expect(givenCount).toBe(8);
  });
});

describe("relabelGrid", () => {
  it("preserves row/col distinctness and cell positions under relabeling", () => {
    const base = [
      [1, 2, 3, 4],
      [2, 4, 1, 3],
      [3, 1, 4, 2],
      [4, 3, 2, 1],
    ];
    for (let i = 0; i < 100; i++) {
      const relabeled = relabelGrid(base, 4);
      expect(hasDistinctRowsAndCols(relabeled, 4)).toBe(true);
    }
  });

  it("preserves an irregular region partition (Bölgesel Sudoku regions)", () => {
    const base = [
      [1, 2, 3, 4],
      [2, 4, 1, 3],
      [3, 1, 4, 2],
      [4, 3, 2, 1],
    ];
    const regions = [
      ["A", "A", "A", "B"],
      ["C", "A", "B", "B"],
      ["C", "C", "D", "B"],
      ["C", "D", "D", "D"],
    ];
    for (let i = 0; i < 100; i++) {
      const relabeled = relabelGrid(base, 4);
      const byRegion = {};
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const reg = regions[r][c];
          byRegion[reg] ||= new Set();
          byRegion[reg].add(relabeled[r][c]);
        }
      }
      for (const values of Object.values(byRegion)) {
        expect(values.size).toBe(4);
      }
    }
  });
});

describe("computeCageClue", () => {
  it("computes sum, product and difference correctly", () => {
    expect(computeCageClue("+", [2, 3])).toEqual({ op: "+", target: 5 });
    expect(computeCageClue("×", [3, 4])).toEqual({ op: "×", target: 12 });
    expect(computeCageClue("−", [5, 2])).toEqual({ op: "−", target: 3 });
  });

  it("falls back to subtraction when division does not divide evenly", () => {
    expect(computeCageClue("÷", [8, 2])).toEqual({ op: "÷", target: 4 });
    expect(computeCageClue("÷", [3, 2])).toEqual({ op: "−", target: 1 });
  });
});
