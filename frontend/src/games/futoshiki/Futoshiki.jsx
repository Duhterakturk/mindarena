import { useMemo, useState } from "react";
import GridFillGame from "../common/GridFillGame";
import { generateLatinSquare, carvePuzzle } from "../common/latinSquare";
import { HORIZONTAL_POSITIONS, VERTICAL_POSITIONS, GIVENS_COUNT } from "./puzzles";

function generate() {
  const solution = generateLatinSquare(4);
  const puzzle = carvePuzzle(solution, GIVENS_COUNT);
  return { puzzle, solution };
}

export default function Futoshiki() {
  const [{ puzzle, solution }, setGame] = useState(generate);

  const horizontal = useMemo(
    () => HORIZONTAL_POSITIONS.map(({ r, c }) => ({ r, c, sign: solution[r][c] < solution[r][c + 1] ? "<" : ">" })),
    [solution]
  );
  const vertical = useMemo(
    () => VERTICAL_POSITIONS.map(({ r, c }) => ({ r, c, sign: solution[r][c] > solution[r + 1][c] ? "v" : "^" })),
    [solution]
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
      instructions="Her satır ve sütun 1-4 rakamlarını birer kez içermeli; < > işaretleri komşu hücreler arasındaki sıralamayı gösterir."
      puzzle={puzzle}
      solution={solution}
      maxDigit={4}
      renderOverlay={renderOverlay}
      onRegenerate={() => setGame(generate())}
    />
  );
}
