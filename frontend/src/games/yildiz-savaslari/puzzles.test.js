import { describe, it, expect } from "vitest";
import { generate } from "./puzzles";

describe("Yıldız Savaşları star placement generator", () => {
  it("places one star per row/column with no two stars touching, across many trials", () => {
    for (let i = 0; i < 300; i++) {
      const { solutionSet } = generate(5);
      expect(solutionSet.length).toBe(5);

      const positions = solutionSet.map((key) => key.split("-").map(Number));
      const rows = new Set(positions.map(([r]) => r));
      const cols = new Set(positions.map(([, c]) => c));
      expect(rows.size).toBe(5);
      expect(cols.size).toBe(5);

      for (let a = 0; a < positions.length; a++) {
        for (let b = a + 1; b < positions.length; b++) {
          const [r1, c1] = positions[a];
          const [r2, c2] = positions[b];
          const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
          expect(touching).toBe(false);
        }
      }
    }
  });
});
