import { describe, expect, it } from "vitest";
import { countLoops, generate, loopHolds } from "./puzzles";

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

describe("patika loop", () => {
  it("builds one closed loop for each book size", () => {
    ["easy", "medium", "hard"].forEach((difficulty, index) => {
      const puzzle = generate(difficulty, mulberry32(30 + index));
      const size = { easy: 8, medium: 9, hard: 10 }[difficulty];
      expect(puzzle.rows).toBe(size);
      expect(puzzle.cols).toBe(size);
      expect(loopHolds(puzzle.blacks, size, puzzle.edges)).toBe(true);
      expect(countLoops(puzzle.blacks, size, 2)).toBe(1);
    });
  });
});
