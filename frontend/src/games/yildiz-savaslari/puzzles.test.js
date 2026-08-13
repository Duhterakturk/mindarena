import { describe, it, expect } from "vitest";
import { generate } from "./puzzles";

const SIZE_BY_DIFFICULTY = { easy: 5, medium: 6, hard: 7 };

describe("Yıldız Savaşları star placement generator", () => {
  it("places one star per row/column with no two stars touching, for every difficulty", () => {
    for (const difficulty of ["easy", "medium", "hard"]) {
      const n = SIZE_BY_DIFFICULTY[difficulty];
      for (let i = 0; i < 100; i++) {
        const { solutionSet, size } = generate(difficulty);
        expect(size).toBe(n);
        expect(solutionSet.length).toBe(n);

        const positions = solutionSet.map((key) => key.split("-").map(Number));
        const rows = new Set(positions.map(([r]) => r));
        const cols = new Set(positions.map(([, c]) => c));
        expect(rows.size).toBe(n);
        expect(cols.size).toBe(n);

        for (let a = 0; a < positions.length; a++) {
          for (let b = a + 1; b < positions.length; b++) {
            const [r1, c1] = positions[a];
            const [r2, c2] = positions[b];
            const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
            expect(touching).toBe(false);
          }
        }
      }
    }
  });
});
