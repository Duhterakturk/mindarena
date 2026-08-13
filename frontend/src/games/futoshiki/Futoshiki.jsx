import { useMemo, useState } from "react";
import GridFillGame from "../common/GridFillGame";
import { generate } from "./puzzles";

export default function Futoshiki() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ puzzle, solution, horizontal: hPositions, vertical: vPositions }, setGame] = useState(() =>
    generate("easy")
  );

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  const horizontal = useMemo(
    () => hPositions.map(({ r, c }) => ({ r, c, sign: solution[r][c] < solution[r][c + 1] ? "<" : ">" })),
    [solution, hPositions]
  );
  const vertical = useMemo(
    () => vPositions.map(({ r, c }) => ({ r, c, sign: solution[r][c] > solution[r + 1][c] ? "v" : "^" })),
    [solution, vPositions]
  );

  function renderOverlay(r, c) {
    const h = horizontal.find((x) => x.r === r && x.c === c);
    const v = vertical.find((x) => x.r === r && x.c === c);
    return (
      <>
        {h && (
          <span className="absolute top-1/2 -right-2 -translate-y-1/2 z-10 text-brand-700 font-bold text-sm pointer-events-none">
            {h.sign}
          </span>
        )}
        {v && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 text-brand-700 font-bold text-sm pointer-events-none">
            {v.sign}
          </span>
        )}
      </>
    );
  }

  return (
    <GridFillGame
      slug="futoshiki"
      title="Futoshiki"
      instructions={`Her satır ve sütun 1-${puzzle.length} rakamlarını birer kez içermeli; < > işaretleri komşu hücreler arasındaki sıralamayı gösterir.`}
      puzzle={puzzle}
      solution={solution}
      maxDigit={puzzle.length}
      renderOverlay={renderOverlay}
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
