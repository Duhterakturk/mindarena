import { describe, it, expect } from "vitest";
import { generateDominoTiling, buildCageData } from "./cages";
import { generateLatinSquare } from "./latinSquare";

describe("generateDominoTiling", () => {
  it("covers every cell exactly once with valid dominoes, for n=4/6/8", () => {
    for (const n of [4, 6, 8]) {
      for (let i = 0; i < 50; i++) {
        const cages = generateDominoTiling(n);
        expect(cages.length).toBe((n * n) / 2);
        const seen = new Set();
        for (const cage of cages) {
          expect(cage.length).toBe(2);
          const [[r1, c1], [r2, c2]] = cage;
          const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
          expect(isAdjacent).toBe(true);
          for (const [r, c] of cage) {
            const key = `${r}-${c}`;
            expect(seen.has(key)).toBe(false);
            seen.add(key);
          }
        }
        expect(seen.size).toBe(n * n);
      }
    }
  });
});

describe("buildCageData", () => {
  it("produces cage metadata covering the full grid with valid clue strings", () => {
    for (const n of [4, 6]) {
      const solution = generateLatinSquare(n);
      const { cageId, cageAnchor, cageCells, cageClues } = buildCageData(n, solution, ["+", "×"]);

      const idsInGrid = new Set(cageId.flat());
      expect(idsInGrid.size).toBe((n * n) / 2);

      for (const id of Object.keys(cageCells)) {
        expect(cageClues[id]).toMatch(/^\d+[+×]$/);
        const [ar, ac] = cageAnchor[id];
        expect(cageId[ar][ac]).toBe(Number(id));
      }
    }
  });
});
