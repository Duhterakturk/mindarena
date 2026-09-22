import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

export default function KareKaralamaca() {
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("kare-karalamaca", difficulty);
  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  const { rowClues, colClues, size } = issue.puzzle;

  return (
    <ToggleGridGame
      slug="kare-karalamaca"
      attemptId={issue.id}
      rows={size}
      cols={size}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="■"
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
