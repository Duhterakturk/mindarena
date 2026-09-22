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
import { shuffle } from "../src/games/common/latinSquare.js";

const SIZE = { easy: 4, medium: 5, hard: 6 };

function open(slug, difficulty) {
  switch (slug) {
    case "sudoku": {
      const puzzle = sudoku(difficulty);
      const proof = { givens: puzzle.puzzle };
      return { public: proof, proof };
    }
    case "kakuro": {
      const puzzle = kakuro(difficulty);
      const proof = { rowSums: puzzle.rowSums, colSums: puzzle.colSums, givens: puzzle.givens };
      return {
        public: { grid: puzzle.grid, size: puzzle.size, rowSums: puzzle.rowSums, colSums: puzzle.colSums, givens: puzzle.givens },
        proof,
      };
    }
    case "bolgesel-sudoku": {
      const puzzle = bolgesel(difficulty);
      const proof = { givens: puzzle.puzzle };
      return { public: proof, proof };
    }
    case "apartman": {
      const puzzle = apartman(difficulty);
      const proof = { givens: puzzle.puzzle, clues: puzzle.clues };
      return { public: proof, proof };
    }
    case "cit": {
      const puzzle = cit(difficulty);
      const proof = { clues: puzzle.clues };
      return { public: { clues: puzzle.clues, size: puzzle.size }, proof };
    }
    case "amiral-batti": {
      const puzzle = amiral(difficulty);
      const proof = { rowClues: puzzle.rowClues, colClues: puzzle.colClues, rows: puzzle.rows, cols: puzzle.cols };
      return { public: proof, proof };
    }
    case "sihirli-piramit": {
      const puzzle = sihirli(difficulty);
      const proof = { rows: puzzle.puzzle };
      return { public: proof, proof };
    }
    case "patika": {
      const puzzle = patika(difficulty);
      const proof = { fixedCells: puzzle.fixedCells, rows: puzzle.rows, cols: puzzle.cols };
      return { public: proof, proof };
    }
    case "abc-baglama": {
      const puzzle = abc(difficulty);
      const proof = { fixedCells: puzzle.fixedCells, rows: puzzle.rows, cols: puzzle.cols };
      return { public: proof, proof };
    }
    case "islem-karesi":
    case "kendoku": {
      const puzzle = (slug === "islem-karesi" ? islem : kendoku)(difficulty);
      const proof = { cageId: puzzle.cageId, cageClues: puzzle.cageClues };
      return {
        public: { givens: puzzle.puzzle, cageId: puzzle.cageId, cageAnchor: puzzle.cageAnchor, cageClues: puzzle.cageClues },
        proof,
      };
    }
    case "yildiz-savaslari": {
      const puzzle = yildiz(difficulty);
      const proof = { regionGrid: puzzle.regionGrid };
      return {
        public: { regionGrid: puzzle.regionGrid, rowClues: puzzle.rowClues, colClues: puzzle.colClues, size: puzzle.size },
        proof,
      };
    }
    case "kare-karalamaca": {
      const puzzle = kare(difficulty);
      const proof = { rowClues: puzzle.rowClues, colClues: puzzle.colClues };
      return { public: { ...proof, size: puzzle.size }, proof };
    }
    case "carpmaca": {
      const puzzle = carpmaca(difficulty);
      const proof = { rowHeaders: puzzle.rowHeaders, colHeaders: puzzle.colHeaders, givens: puzzle.puzzle };
      return { public: proof, proof };
    }
    case "futoshiki": {
      const puzzle = futoshiki(difficulty);
      const proof = { givens: puzzle.puzzle, horizontal: puzzle.horizontal, vertical: puzzle.vertical };
      return { public: proof, proof };
    }
    case "pentominolar": {
      const puzzle = pentomino(difficulty);
      const proof = { pieces: puzzle.pieces, region: puzzle.region };
      return { public: { ...proof, rows: puzzle.rows, cols: puzzle.cols }, proof };
    }
    case "metaforms": {
      const rounds = metaRounds(difficulty).map(({ shapes }) => ({ shapes }));
      const proof = { rounds };
      return { public: proof, proof };
    }
    case "numbers": {
      const n = SIZE[difficulty] || 4;
      const proof = { values: shuffle(Array.from({ length: n * n }, (_, i) => i + 1)) };
      return { public: proof, proof };
    }
    case "colours": {
      const proof = { rounds: colourRounds(difficulty) };
      return { public: proof, proof };
    }
    default:
      throw new Error(`Bilinmeyen oyun: ${slug}`);
  }
}

const slug = process.argv[2];
const difficulty = process.argv[3] || "easy";
process.stdout.write(JSON.stringify(open(slug, difficulty)));
