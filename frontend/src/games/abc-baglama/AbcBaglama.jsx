import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { isConnectionPuzzleSolved } from "../common/pathValidation";
import { generate } from "./puzzles";

export default function AbcBaglama() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ solutionSet, fixedCells, rows, cols }, setGame] = useState(() => generate("easy"));

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  return (
    <ToggleGridGame
      slug="abc-baglama"
      title="ABC Bağlama"
      instructions="Aynı harfe sahip hücreleri, birbirini kesmeyen yatay/dikey bir çizgiyle birleştir."
      rows={rows}
      cols={cols}
      solutionSet={solutionSet}
      fixedCells={fixedCells}
      validate={isConnectionPuzzleSolved}
      markSymbol="—"
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
