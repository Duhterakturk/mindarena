import { describe, expect, it } from "vitest";
import { countFlows, generate } from "./puzzles";

const PAIRS = { easy: [4], medium: [5], hard: [6, 7] };

describe("harf bağlama", () => {
  it("deals a unique full cover for each difficulty within three seconds", () => {
    for (const difficulty of ["easy", "medium", "hard"]) {
      for (let index = 0; index < 20; index += 1) {
        const started = Date.now();
        const puzzle = generate(difficulty);
        expect(Date.now() - started).toBeLessThan(3000);
        expect(puzzle.rows).toBe(puzzle.cols);
        const letters = Object.keys(puzzle.paths);
        expect(PAIRS[difficulty]).toContain(letters.length);
        const covered = new Set();
        for (const [letter, path] of Object.entries(puzzle.paths)) {
          expect(path.length).toBeGreaterThanOrEqual(3);
          expect(puzzle.fixedCells[path[0]]).toBe(letter);
          expect(puzzle.fixedCells[path[path.length - 1]]).toBe(letter);
          for (const cell of path) covered.add(cell);
        }
        expect(covered.size).toBe(puzzle.rows * puzzle.cols);
        expect(countFlows(puzzle.fixedCells, puzzle.rows)).toBe(1);
      }
    }
  }, 180000);
});
