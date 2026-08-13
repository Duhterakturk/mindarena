import { useState } from "react";
import GridFillGame from "../common/GridFillGame";
import { generate } from "./puzzles";

export default function IslemKaresi() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ puzzle, solution, cageId, cageAnchor, cageClues }, setGame] = useState(() => generate("easy"));

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

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
      instructions={`Her satır ve sütun 1-${puzzle.length} rakamlarını birer kez içermeli; her kafes kendi işlem sonucunu vermelidir.`}
      puzzle={puzzle}
      solution={solution}
      maxDigit={puzzle.length}
      cellClassName={cellClassName}
      renderOverlay={renderOverlay}
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
