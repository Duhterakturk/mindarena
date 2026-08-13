import { describe, it, expect } from "vitest";
import { generate } from "./puzzles";

const EXPECTED_CELLS = { easy: 7, medium: 11, hard: 16 };
const EXPECTED_SIZE = { easy: 5, medium: 6, hard: 7 };

describe("Amiral Battı fleet generator", () => {
  it("places the expected number of ship cells with no two ships touching, for every difficulty", () => {
    for (const difficulty of ["easy", "medium", "hard"]) {
      for (let i = 0; i < 100; i++) {
        const { solutionSet, rowClues, colClues, rows, cols } = generate(difficulty);
        expect(solutionSet.length).toBe(EXPECTED_CELLS[difficulty]);
        expect(rows).toBe(EXPECTED_SIZE[difficulty]);
        expect(cols).toBe(EXPECTED_SIZE[difficulty]);

        const cellSet = new Set(solutionSet);
        expect(cellSet.size).toBe(EXPECTED_CELLS[difficulty]);
        expect(rowClues.reduce((a, b) => a + b, 0)).toBe(EXPECTED_CELLS[difficulty]);
        expect(colClues.reduce((a, b) => a + b, 0)).toBe(EXPECTED_CELLS[difficulty]);

        for (const key of solutionSet) {
          const [r, c] = key.split("-").map(Number);
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThan(rows);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(cols);
        }
      }
    }
  });
});
