import { useMemo, useState } from "react";
import GridFillGame from "../common/GridFillGame";
import { generateLatinSquare, computeCageClue } from "../common/latinSquare";
import { cageId, cageOp, cageAnchor, cageCells } from "./puzzles";

function generate() {
  const solution = generateLatinSquare(4);
  const puzzle = solution.map((row) => row.map(() => 0));
  return { puzzle, solution };
}

export default function IslemKaresi() {
  const [{ puzzle, solution }, setGame] = useState(generate);

  const cageClues = useMemo(() => {
    const clues = {};
    for (const id of Object.keys(cageCells)) {
      const values = cageCells[id].map(([r, c]) => solution[r][c]);
      const { op, target } = computeCageClue(cageOp[id], values);
      clues[id] = `${target}${op}`;
    }
    return clues;
  }, [solution]);

  function cellClassName(r, c) {
    const id = cageId[r][c];
    const classes = [];
    if (c === cageId[0].length - 1 || cageId[r][c + 1] !== id) classes.push("border-r-4 border-r-slate-700");
    if (r === cageId.length - 1 || cageId[r + 1][c] !== id) classes.push("border-b-4 border-b-slate-700");
    return classes.join(" ");
  }

  function renderOverlay(r, c) {
    const id = cageId[r][c];
    const [ar, ac] = cageAnchor[id];
    if (ar !== r || ac !== c) return null;
    return (
      <span className="absolute top-0.5 left-1 text-[10px] font-bold text-brand-700 pointer-events-none">
        {cageClues[id]}
      </span>
    );
  }

  return (
    <GridFillGame
      slug="islem-karesi"
      title="İşlem Karesi"
      instructions="Her satır ve sütun 1-4 rakamlarını birer kez içermeli; her kafes kendi işlem sonucunu vermelidir."
      puzzle={puzzle}
      solution={solution}
      maxDigit={4}
      cellClassName={cellClassName}
      renderOverlay={renderOverlay}
      onRegenerate={() => setGame(generate())}
    />
  );
}
