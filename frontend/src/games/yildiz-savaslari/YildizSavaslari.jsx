import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function YildizSavaslari() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ solutionSet, rowClues, colClues, size }, setGame] = useState(() => generate("easy"));

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  return (
    <ToggleGridGame
      slug="yildiz-savaslari"
      title="Yıldız Savaşları"
      instructions="Her satıra ve her sütuna tam olarak bir yıldız yerleştir. İki yıldız, yatay/dikey/çapraz komşu olamaz."
      rows={size}
      cols={size}
      solutionSet={solutionSet}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="★"
      onRegenerate={() => setGame(generate(difficulty))}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    />
  );
}
