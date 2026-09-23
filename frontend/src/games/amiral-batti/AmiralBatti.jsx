import ToggleGridGame from "../common/ToggleGridGame";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

export default function AmiralBatti() {
  const [difficulty, setDifficulty] = useStartingDifficulty();
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
      allowCross
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
