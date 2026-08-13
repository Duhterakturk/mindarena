import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function AmiralBatti() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ solutionSet, rowClues, colClues, rows, cols }, setGame] = useState(() => generate("easy"));

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  return (
    <ToggleGridGame
      slug="amiral-batti"
      title="Amiral Battı"
      instructions="Satır ve sütun ipuçlarına göre gemi hücrelerine tıklayarak filoyu yerleştir."
      rows={rows}
      cols={cols}
      solutionSet={solutionSet}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="🚢"
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
