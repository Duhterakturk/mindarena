import { describe, it, expect } from "vitest";
import { generate } from "./puzzles";

const EXPECTED = {
  easy: { gridSize: 5, count: 1 },
  medium: { gridSize: 6, count: 2 },
  hard: { gridSize: 7, count: 3 },
};

describe("Pentominolar generator", () => {
  it("places the expected number of non-overlapping pentominoes, for every difficulty", () => {
    for (const difficulty of ["easy", "medium", "hard"]) {
      const { count, gridSize: expectedSize } = EXPECTED[difficulty];
      for (let i = 0; i < 50; i++) {
        const { shapes, solutionSet, gridSize } = generate(difficulty);
        expect(gridSize).toBe(expectedSize);
        expect(shapes.length).toBe(count);
        expect(solutionSet.length).toBe(count * 5);

        const uniqueCells = new Set(solutionSet);
        expect(uniqueCells.size).toBe(count * 5); // no overlap

        for (const key of solutionSet) {
          const [r, c] = key.split("-").map(Number);
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThan(gridSize);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(gridSize);
        }
      }
    }
  });
});
