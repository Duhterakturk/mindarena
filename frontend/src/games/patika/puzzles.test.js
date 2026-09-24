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

function tightRatio(blacks, size) {
  const blocked = new Set(blacks);
  let whites = 0;
  let tight = 0;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = `${row}-${col}`;
      if (blocked.has(cell)) continue;
      whites += 1;
      let open = 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const next = `${row + dr}-${col + dc}`;
        if (row + dr >= 0 && row + dr < size && col + dc >= 0 && col + dc < size && !blocked.has(next)) open += 1;
      });
      if (open === 2) tight += 1;
    }
  }
  return tight / whites;
}

describe("patika loop", () => {
  it("deals a sparse board with one loop", () => {
    ["easy", "medium", "hard"].forEach((difficulty) => {
      for (let round = 0; round < 10; round += 1) {
        const started = Date.now();
        const puzzle = generate(difficulty, mulberry32(120 + round * 19 + difficulty.length * 40));
        expect(Date.now() - started).toBeLessThan(3000);
        const size = puzzle.rows;
        const ratio = puzzle.blacks.length / (size * size);
        expect(ratio).toBeGreaterThanOrEqual(0.12);
        expect(ratio).toBeLessThanOrEqual(0.28);
        expect(tightRatio(puzzle.blacks, size)).toBeLessThanOrEqual(0.4);
        expect(countLoops(puzzle.blacks, size, 2)).toBe(1);
        expect(loopHolds(puzzle.blacks, size, puzzle.edges)).toBe(true);
      }
    });
  }, 90000);

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
