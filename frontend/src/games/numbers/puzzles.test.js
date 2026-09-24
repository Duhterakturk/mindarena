import { describe, expect, it } from "vitest";
import { clueHolds, countGrids, generate, holds, solve } from "./puzzles";

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

describe("numbers", () => {
  it("builds one starred grid for each difficulty", () => {
    ["easy", "medium", "hard"].forEach((difficulty, index) => {
      const puzzle = generate(difficulty, mulberry32(21 + index));
      expect(puzzle.solution).toHaveLength(difficulty === "easy" ? 3 : 4);
      expect(puzzle.clues.every((clue) => clueHolds(puzzle.solution, clue))).toBe(true);
      expect(countGrids(puzzle.clues, puzzle.givens, 2)).toBe(1);
    });
  });

  it("solves the book questions with one layout each", () => {
    const questions = [
      {
        clues: [
          { kind: "equation", left: "A/I", right: "H/D" },
          { kind: "equation", left: "D", right: "B/F" },
          { kind: "relation", op: "+", cells: ["C", "D", "G"] },
          { kind: "total", op: "+", cells: ["A", "C"], target: 16 },
        ],
        grid: [[9, 8, 7], [2, 1, 4], [5, 6, 3]],
      },
      {
        clues: [
          { kind: "relation", op: "*", cells: ["B", "D", "F"] },
          { kind: "equation", left: "E", right: "G+B" },
          { kind: "total", op: "+", cells: ["A", "D", "G"], target: 6 },
          { kind: "equation", left: "H", right: "C-A" },
          { kind: "total", op: "+", cells: ["C", "F", "I"], target: 24 },
        ],
        grid: [[3, 4, 9], [2, 5, 8], [1, 6, 7]],
      },
      {
        clues: [
          { kind: "relation", op: "+", cells: ["E", "F", "I"] },
          { kind: "relation", op: "+", cells: ["A", "C", "E"] },
          { kind: "total", op: "+", cells: ["A", "D", "G"], target: 7 },
          { kind: "equation", left: "G", right: "D-F" },
          { kind: "total", op: "+", cells: ["B", "E", "H"], target: 24 },
          { kind: "relation", op: "+", cells: ["D", "F", "H"] },
        ],
        grid: [[2, 9, 6], [4, 8, 3], [1, 7, 5]],
      },
    ];
    questions.forEach((question) => {
      expect(question.clues.every((clue) => holds(question.grid, clue))).toBe(true);
      expect(solve(question.clues)).toEqual([question.grid]);
    });
  });
});
