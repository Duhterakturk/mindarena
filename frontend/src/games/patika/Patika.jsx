import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { isSequentialPathSolved } from "../common/pathValidation";
import { generate } from "./puzzles";

export default function Patika() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ solutionSet, fixedCells, rows, cols }, setGame] = useState(() => generate("easy"));

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  return (
    <ToggleGridGame
      slug="patika"
      title="Patika"
      instructions="1'den 4'e kadar numaralı noktaları, yatay/dikey adımlarla kesintisiz bir yol oluşturacak şekilde birleştir."
      rows={rows}
      cols={cols}
      solutionSet={solutionSet}
      fixedCells={fixedCells}
      validate={isSequentialPathSolved}
      markSymbol="•"
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
