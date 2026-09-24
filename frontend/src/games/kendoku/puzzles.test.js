import { describe, expect, it } from "vitest";
import { countCages } from "../common/solvers";
import { generate } from "./puzzles";

describe("kendoku", () => {
  it("deals one unique board within three seconds", () => {
    ["easy", "medium", "hard"].forEach((difficulty) => {
      const size = { easy: 4, medium: 5, hard: 6 }[difficulty];
      for (let round = 0; round < 20; round += 1) {
        const started = Date.now();
        const puzzle = generate(difficulty);
        expect(Date.now() - started).toBeLessThan(3000);
        expect(puzzle.solution.length).toBeGreaterThanOrEqual(4);
        expect(puzzle.solution.length).toBeLessThanOrEqual(size);
        const empty = puzzle.solution.map((row) => row.map(() => 0));
        expect(countCages(empty, puzzle.cageId, puzzle.cageClues)).toBe(1);
      }
    });
  }, 120000);
});
