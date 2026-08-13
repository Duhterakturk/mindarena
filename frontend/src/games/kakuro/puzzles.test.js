import { describe, it, expect } from "vitest";
import { generateKakuroSolution, generate } from "./puzzles";

describe("generateKakuroSolution", () => {
  it("produces a grid with distinct values per row and per column, for n=4/6/8", () => {
    for (const n of [4, 6, 8]) {
      for (let i = 0; i < 100; i++) {
        const grid = generateKakuroSolution(n);
        for (const row of grid) {
          expect(new Set(row).size).toBe(n);
        }
        for (let c = 0; c < n; c++) {
          const col = grid.map((row) => row[c]);
          expect(new Set(col).size).toBe(n);
        }
      }
    }
  });

  it("does not always sum rows/cols to the same value (unlike a 1-n Latin square)", () => {
    const sums = new Set();
    for (let i = 0; i < 20; i++) {
      const grid = generateKakuroSolution(4);
      grid.forEach((row) => sums.add(row.reduce((a, b) => a + b, 0)));
    }
    expect(sums.size).toBeGreaterThan(1);
  });
});

describe("generate", () => {
  it("scales grid size with difficulty", () => {
    expect(generate("easy").size).toBe(4);
    expect(generate("medium").size).toBe(6);
    expect(generate("hard").size).toBe(8);
  });
});
