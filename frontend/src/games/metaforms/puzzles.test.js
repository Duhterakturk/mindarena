import { describe, expect, it } from "vitest";
import { PUZZLE_12, isValid, solve } from "./puzzles";

const SOLUTION = [
  ["RS", "YT", "BC"],
  ["BT", "RC", "YC"],
  ["YS", "RT", "BS"],
];

describe("metaforms clues", () => {
  it("accepts the book solution and no other layout", () => {
    expect(isValid(SOLUTION, PUZZLE_12.clues)).toBe(true);
    const swapped = SOLUTION.map((row) => row.slice());
    const first = swapped[0][0];
    swapped[0][0] = swapped[0][1];
    swapped[0][1] = first;
    expect(isValid(swapped, PUZZLE_12.clues)).toBe(false);
    const found = solve(PUZZLE_12.clues);
    expect(found).toEqual([SOLUTION]);
  });
});
