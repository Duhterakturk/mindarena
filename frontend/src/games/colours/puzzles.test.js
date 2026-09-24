import { describe, expect, it } from "vitest";
import { QUESTION_3, holds, solve } from "./puzzles";

const SOLUTION = [
  ["GC", "BC", "GS"],
  ["YC", "YS", "RC"],
  ["BS", "RS", "KC"],
];

describe("colours", () => {
  it("solves book question 3 with one layout", () => {
    expect(QUESTION_3.clues.every((clue) => holds(SOLUTION, clue))).toBe(true);
    expect(solve(QUESTION_3.clues)).toEqual([SOLUTION]);
  });
});
