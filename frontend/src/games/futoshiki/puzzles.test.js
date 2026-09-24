import { describe, expect, it } from "vitest";
import { countLatin } from "../common/solvers";
import { generate } from "./puzzles";

function signsHold(grid, horizontal, vertical) {
  return horizontal.every(({ r, c, sign }) => (sign === "<" ? grid[r][c] < grid[r][c + 1] : grid[r][c] > grid[r][c + 1]))
    && vertical.every(({ r, c, sign }) => (sign === "v" ? grid[r][c] > grid[r + 1][c] : grid[r][c] < grid[r + 1][c]));
}

describe("futoshiki", () => {
  it("deals one unique board within three seconds", () => {
    ["easy", "medium", "hard"].forEach((difficulty) => {
      const size = { easy: 4, medium: 5, hard: 5 }[difficulty];
      for (let round = 0; round < 20; round += 1) {
        const started = Date.now();
        const puzzle = generate(difficulty);
        expect(Date.now() - started).toBeLessThan(3000);
        expect(puzzle.size).toBeGreaterThanOrEqual(4);
        expect(puzzle.size).toBeLessThanOrEqual(size);
        expect(countLatin(puzzle.puzzle, 2, (grid) => signsHold(grid, puzzle.horizontal, puzzle.vertical))).toBe(1);
      }
    });
  }, 120000);
});
