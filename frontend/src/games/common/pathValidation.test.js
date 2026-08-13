import { describe, it, expect } from "vitest";
import { isConnectionPuzzleSolved, isSequentialPathSolved } from "./pathValidation";

describe("isConnectionPuzzleSolved (ABC Bağlama)", () => {
  const fixedCells = { "0-0": "A", "2-2": "A" };

  it("kabul eder: sağa sonra aşağı giden yol", () => {
    const marked = new Set(["0-1", "0-2", "1-2"]);
    expect(isConnectionPuzzleSolved(marked, fixedCells)).toBe(true);
  });

  it("kabul eder: aşağı sonra sağa giden FARKLI ama geçerli yol (dikey içerir)", () => {
    const marked = new Set(["1-0", "2-0", "2-1"]);
    expect(isConnectionPuzzleSolved(marked, fixedCells)).toBe(true);
  });

  it("reddeder: eksik/tamamlanmamış yol", () => {
    const marked = new Set(["0-1"]);
    expect(isConnectionPuzzleSolved(marked, fixedCells)).toBe(false);
  });

  it("reddeder: başıboş (hiçbir etikete bağlı olmayan) işaretli hücre", () => {
    const marked = new Set(["0-1", "0-2", "1-2", "3-3"]);
    expect(isConnectionPuzzleSolved(marked, { "0-0": "A", "2-2": "A", "3-1": "B", "1-3": "B" })).toBe(false);
  });

  it("çoklu çift: her ikisi de doğru bağlanınca kabul eder", () => {
    const twoPairs = { "0-0": "A", "0-2": "A", "2-0": "B", "2-2": "B" };
    const marked = new Set(["0-1", "2-1"]);
    expect(isConnectionPuzzleSolved(marked, twoPairs)).toBe(true);
  });
});

describe("isSequentialPathSolved (Patika)", () => {
  const fixedCells = { "0-0": "1", "0-2": "2", "0-4": "3", "0-6": "4" };

  it("kabul eder: sıralı tam yol", () => {
    const marked = new Set(["0-1", "0-3", "0-5"]);
    expect(isSequentialPathSolved(marked, fixedCells)).toBe(true);
  });

  it("reddeder: kopuk yol", () => {
    const marked = new Set(["0-1", "0-5"]);
    expect(isSequentialPathSolved(marked, fixedCells)).toBe(false);
  });

  it("reddeder: dallanan yol", () => {
    const marked = new Set(["0-1", "0-3", "0-5", "1-3"]);
    expect(isSequentialPathSolved(marked, fixedCells)).toBe(false);
  });
});
