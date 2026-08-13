import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function KareKaralamaca() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ solutionSet, rowClues, colClues, size }, setGame] = useState(() => generate("easy"));

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  return (
    <ToggleGridGame
      slug="kare-karalamaca"
      title="Kare Karalamaca"
      instructions="Satır ve sütun ipuçlarına göre hücreleri karala; gizli deseni ortaya çıkar."
      rows={size}
      cols={size}
      solutionSet={solutionSet}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="■"
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
