import { describe, expect, it } from "vitest";
import { countSolutions, generate, satisfies } from "./puzzles";

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

describe("metaforms placement", () => {
  it("builds one valid layout for each difficulty", () => {
    ["easy", "medium", "hard"].forEach((difficulty, index) => {
      const puzzle = generate(difficulty, mulberry32(11 + index));
      const pieces = puzzle.solution.flat().map((piece) => `${piece.shape}:${piece.color}`);
      expect(new Set(pieces).size).toBe(9);
      expect(satisfies(puzzle.solution, puzzle.clues)).toBe(true);
      expect(countSolutions(puzzle.clues, 2)).toBe(1);
      const swapped = puzzle.solution.map((row) => row.map((piece) => ({ ...piece })));
      const first = swapped[0][0];
      swapped[0][0] = swapped[0][1];
      swapped[0][1] = first;
      expect(satisfies(swapped, puzzle.clues)).toBe(false);
      const pins = puzzle.clues.filter((clue) => clue.sign === "yes" && clue.shape && clue.color && clue.cells.length === 1);
      if (difficulty === "easy") expect(pins.length).toBeLessThanOrEqual(2);
      if (difficulty === "hard") expect(pins.length).toBe(0);
      expect(puzzle.clues.some((clue) => clue.cells.length > 1 || clue.sign === "no" || !clue.shape || !clue.color)).toBe(true);
    });
  });
});
