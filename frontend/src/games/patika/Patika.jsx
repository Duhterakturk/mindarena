import ToggleGridGame from "../common/ToggleGridGame";
import { isSequentialPathSolved } from "../common/pathValidation";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

export default function Patika() {
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("patika", difficulty);
  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  const { fixedCells, rows, cols } = issue.puzzle;

  return (
    <ToggleGridGame
      slug="patika"
      attemptId={issue.id}
      rows={rows}
      cols={cols}
      fixedCells={fixedCells}
      validate={isSequentialPathSolved}
      markSymbol="•"
      onRegenerate={reload}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
    />
  );
}
