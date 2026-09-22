import { useState } from "react";
import GridFillGame from "../common/GridFillGame";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

export default function Futoshiki() {
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("futoshiki", difficulty);
  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  const { givens: puzzle, horizontal, vertical } = issue.puzzle;

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
      attemptId={issue.id}
      puzzle={puzzle}
      maxDigit={puzzle.length}
      renderOverlay={renderOverlay}
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
