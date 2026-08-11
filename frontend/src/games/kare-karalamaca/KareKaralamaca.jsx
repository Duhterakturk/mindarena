import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function KareKaralamaca() {
  const [{ solutionSet, rowClues, colClues }, setGame] = useState(generate);

  return (
    <ToggleGridGame
      slug="kare-karalamaca"
      title="Kare Karalamaca"
      instructions="Satır ve sütun ipuçlarına göre hücreleri karala; gizli deseni ortaya çıkar."
      rows={5}
      cols={5}
      solutionSet={solutionSet}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="■"
      onRegenerate={() => setGame(generate())}
    />
  );
}
