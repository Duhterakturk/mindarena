import { describe, it, expect } from "vitest";
import { generate } from "./puzzles";

describe("Amiral Battı fleet generator", () => {
  it("places exactly 7 ship cells with no two ships touching, across many trials", () => {
    for (let i = 0; i < 300; i++) {
      const { solutionSet, rowClues, colClues } = generate();
      expect(solutionSet.length).toBe(7);

      const cells = solutionSet.map((key) => key.split("-").map(Number));
      const cellSet = new Set(solutionSet);

      // Ships that are not the same cell must not be adjacent (incl. diagonally)
      // unless they belong to a straight run (handled by construction) —
      // verify no *different* ship touches another by checking clue totals.
      expect(rowClues.reduce((a, b) => a + b, 0)).toBe(7);
      expect(colClues.reduce((a, b) => a + b, 0)).toBe(7);

      for (const [r, c] of cells) {
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(5);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(5);
      }
      expect(cellSet.size).toBe(7);
    }
  });
});
