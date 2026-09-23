import { describe, expect, it } from "vitest";
import { clueHolds, countGrids, generate } from "./puzzles";

function mulberry32(seed) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

describe("numbers", () => {
  it("builds one starred grid for each difficulty", () => {
    ["easy", "medium", "hard"].forEach((difficulty, index) => {
      const puzzle = generate(difficulty, mulberry32(21 + index));
      expect(puzzle.solution).toHaveLength(difficulty === "easy" ? 3 : 4);
      expect(puzzle.clues.every((clue) => clueHolds(puzzle.solution, clue))).toBe(true);
      expect(countGrids(puzzle.clues, puzzle.givens, 2)).toBe(1);
    });
  });
});
