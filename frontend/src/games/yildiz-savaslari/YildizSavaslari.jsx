import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

export default function YildizSavaslari() {
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("yildiz-savaslari", difficulty);
  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  const { rowClues, colClues, regionGrid, size } = issue.puzzle;

  return (
    <ToggleGridGame
      slug="yildiz-savaslari"
      attemptId={issue.id}
      rows={size}
      cols={size}
      rowClues={rowClues}
      colClues={colClues}
      regionGrid={regionGrid}
      markSymbol="★"
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
