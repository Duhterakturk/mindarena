import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

export default function AmiralBatti() {
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("amiral-batti", difficulty);
  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  const { rowClues, colClues, rows, cols } = issue.puzzle;

  return (
    <ToggleGridGame
      slug="amiral-batti"
      attemptId={issue.id}
      rows={rows}
      cols={cols}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="🚢"
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
