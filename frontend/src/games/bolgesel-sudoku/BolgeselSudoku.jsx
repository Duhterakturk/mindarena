import { useState } from "react";
import GridFillGame from "../common/GridFillGame";
import { relabelGrid, carvePuzzle } from "../common/latinSquare";
import { BASE_SOLUTION, REGIONS, GIVENS_COUNT } from "./puzzles";

const REGION_BG = {
  A: "bg-brand-50",
  B: "bg-amber-50",
  C: "bg-emerald-50",
  D: "bg-rose-50",
};

function generate() {
  const solution = relabelGrid(BASE_SOLUTION, 4);
  const puzzle = carvePuzzle(solution, GIVENS_COUNT);
  return { puzzle, solution };
}

export default function BolgeselSudoku() {
  const [{ puzzle, solution }, setGame] = useState(generate);

  function cellClassName(r, c) {
    const region = REGIONS[r][c];
    const classes = [REGION_BG[region]];
    if (c === REGIONS[0].length - 1 || REGIONS[r][c + 1] !== region) classes.push("border-r-4 border-r-slate-700");
    if (r === REGIONS.length - 1 || REGIONS[r + 1][c] !== region) classes.push("border-b-4 border-b-slate-700");
    return classes.join(" ");
  }

  return (
    <GridFillGame
      slug="bolgesel-sudoku"
      title="Bölgesel Sudoku"
      instructions="Her satır, sütun ve renkli bölge 1-4 rakamlarını birer kez içermelidir."
      puzzle={puzzle}
      solution={solution}
      maxDigit={4}
      cellClassName={cellClassName}
      onRegenerate={() => setGame(generate())}
    />
  );
}
