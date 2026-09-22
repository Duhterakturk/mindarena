import { writeFileSync } from "node:fs";
import { generate as kakuro } from "../src/games/kakuro/puzzles.js";
import { generate as sudoku } from "../src/games/sudoku/puzzles.js";
import { generate as bolgesel } from "../src/games/bolgesel-sudoku/puzzles.js";
import { generate as apartman } from "../src/games/apartman/puzzles.js";
import { generate as cit } from "../src/games/cit/puzzles.js";
import { generate as amiral } from "../src/games/amiral-batti/puzzles.js";
import { generate as sihirli } from "../src/games/sihirli-piramit/puzzles.js";
import { generate as patika } from "../src/games/patika/puzzles.js";
import { generate as abc } from "../src/games/abc-baglama/puzzles.js";
import { generate as islem } from "../src/games/islem-karesi/puzzles.js";
import { generate as kendoku } from "../src/games/kendoku/puzzles.js";
import { generate as yildiz } from "../src/games/yildiz-savaslari/puzzles.js";
import { generate as kare } from "../src/games/kare-karalamaca/puzzles.js";
import { generate as carpmaca } from "../src/games/carpmaca/puzzles.js";
import { generate as futoshiki } from "../src/games/futoshiki/puzzles.js";
import { generate as pentomino } from "../src/games/pentominolar/puzzles.js";
import { generateRounds as metaRounds } from "../src/games/metaforms/rounds.js";
import { generateRounds as colourRounds } from "../src/games/colours/rounds.js";

const rounds = {
  kakuro: (() => {
    const puzzle = kakuro("easy");
    return { puzzle: { rowSums: puzzle.rowSums, colSums: puzzle.colSums, givens: puzzle.givens }, answer: puzzle.fullSolution.slice(1).map((row) => row.slice(1)) };
  })(),
  sudoku: (() => {
    const puzzle = sudoku("easy");
    return { puzzle: { givens: puzzle.puzzle }, answer: puzzle.solution };
  })(),
  "bolgesel-sudoku": (() => {
    const puzzle = bolgesel("easy");
    return { puzzle: { givens: puzzle.puzzle }, answer: puzzle.solution };
  })(),
  apartman: (() => {
    const puzzle = apartman("easy");
    return { puzzle: { givens: puzzle.puzzle, clues: puzzle.clues }, answer: puzzle.solution };
  })(),
  cit: (() => {
    const puzzle = cit("easy");
    return { puzzle: { clues: puzzle.clues }, answer: { horizontal: puzzle.horizontalSolution, vertical: puzzle.verticalSolution } };
  })(),
  "amiral-batti": (() => {
    const puzzle = amiral("easy");
    return { puzzle: { rowClues: puzzle.rowClues, colClues: puzzle.colClues, rows: puzzle.rows, cols: puzzle.cols }, answer: { cells: puzzle.solutionSet } };
  })(),
  "sihirli-piramit": (() => {
    const puzzle = sihirli("easy");
    return { puzzle: { rows: puzzle.puzzle }, answer: puzzle.solution };
  })(),
  patika: (() => {
    const puzzle = patika("easy");
    const fixed = new Set(Object.keys(puzzle.fixedCells));
    return { puzzle: { fixedCells: puzzle.fixedCells, rows: puzzle.rows, cols: puzzle.cols }, answer: { cells: puzzle.solutionSet.filter((key) => !fixed.has(key)) } };
  })(),
  "abc-baglama": (() => {
    const puzzle = abc("easy");
    const fixed = new Set(Object.keys(puzzle.fixedCells));
    return { puzzle: { fixedCells: puzzle.fixedCells, rows: puzzle.rows, cols: puzzle.cols }, answer: { cells: puzzle.solutionSet.filter((key) => !fixed.has(key)) } };
  })(),
  "islem-karesi": (() => {
    const puzzle = islem("easy");
    return { puzzle: { cageId: puzzle.cageId, cageClues: puzzle.cageClues }, answer: puzzle.solution };
  })(),
  kendoku: (() => {
    const puzzle = kendoku("easy");
    return { puzzle: { cageId: puzzle.cageId, cageClues: puzzle.cageClues }, answer: puzzle.solution };
  })(),
  "yildiz-savaslari": (() => {
    const puzzle = yildiz("easy");
    return { puzzle: { regionGrid: puzzle.regionGrid }, answer: { cells: puzzle.solutionSet } };
  })(),
  "kare-karalamaca": (() => {
    const puzzle = kare("easy");
    return { puzzle: { rowClues: puzzle.rowClues, colClues: puzzle.colClues }, answer: { cells: puzzle.solutionSet } };
  })(),
  carpmaca: (() => {
    const puzzle = carpmaca("easy");
    return { puzzle: { rowHeaders: puzzle.rowHeaders, colHeaders: puzzle.colHeaders, givens: puzzle.puzzle }, answer: puzzle.solution };
  })(),
  futoshiki: (() => {
    const puzzle = futoshiki("easy");
    return { puzzle: { givens: puzzle.puzzle, horizontal: puzzle.horizontal, vertical: puzzle.vertical }, answer: puzzle.solution };
  })(),
  pentominolar: (() => {
    const puzzle = pentomino("easy");
    return { puzzle: { pieces: puzzle.pieces, region: puzzle.region }, answer: { placements: puzzle.solutionPlacements } };
  })(),
  metaforms: (() => {
    const rounds = metaRounds("easy");
    return { puzzle: { rounds: rounds.map(({ shapes }) => ({ shapes })) }, answer: { choices: rounds.map((round) => round.oddIndex) } };
  })(),
  numbers: { puzzle: { values: [3, 1, 8, 12, 5, 16, 9, 2, 14, 7, 4, 11, 6, 15, 10, 13] }, answer: { done: true } },
  colours: (() => {
    const rounds = colourRounds("easy");
    return { puzzle: { rounds }, answer: { choices: rounds.map((round) => round.inkId) } };
  })(),
};

const target = new URL("../../backend/tests/fixtures/rounds.json", import.meta.url);
writeFileSync(target, JSON.stringify(rounds));
console.log("wrote", target.pathname, Object.keys(rounds).length);
