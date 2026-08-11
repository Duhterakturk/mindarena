import { describe, it, expect } from "vitest";
import { generateKakuroSolution } from "./puzzles";

describe("generateKakuroSolution", () => {
  it("produces a grid with distinct values per row and per column across many trials", () => {
    for (let i = 0; i < 200; i++) {
      const grid = generateKakuroSolution(4, 4, 9);
      for (const row of grid) {
        expect(new Set(row).size).toBe(4);
      }
      for (let c = 0; c < 4; c++) {
        const col = grid.map((row) => row[c]);
        expect(new Set(col).size).toBe(4);
      }
    }
  });

  it("does not always sum rows/cols to the same value (unlike a 1-4 Latin square)", () => {
    const sums = new Set();
    for (let i = 0; i < 20; i++) {
      const grid = generateKakuroSolution(4, 4, 9);
      grid.forEach((row) => sums.add(row.reduce((a, b) => a + b, 0)));
    }
    expect(sums.size).toBeGreaterThan(1);
  });
});
