import { describe, expect, it } from "vitest";
import { countPaths, generate, pathIsMagic } from "./puzzles";

describe("Sihirli Piramit", () => {
  it("builds one path that uses every number once", () => {
    const height = { easy: 4, medium: 5, hard: 6 };
    for (const difficulty of Object.keys(height)) {
      const puzzle = generate(difficulty, () => 0.37);
      expect(puzzle.rows).toHaveLength(height[difficulty]);
      expect(puzzle.rows.every((row, index) => row.length === index + 1)).toBe(true);
      expect(pathIsMagic(puzzle.rows, puzzle.path)).toBe(true);
      expect(countPaths(puzzle.rows)).toBe(1);
    }
  });
});
