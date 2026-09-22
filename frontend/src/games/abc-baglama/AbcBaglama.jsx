import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { isConnectionPuzzleSolved } from "../common/pathValidation";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

export default function AbcBaglama() {
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("abc-baglama", difficulty);
  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  const { fixedCells, rows, cols } = issue.puzzle;

  return (
    <ToggleGridGame
      slug="abc-baglama"
      attemptId={issue.id}
      rows={rows}
      cols={cols}
      fixedCells={fixedCells}
      validate={isConnectionPuzzleSolved}
      markSymbol="—"
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
