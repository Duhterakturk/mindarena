import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function AmiralBatti() {
  const [{ solutionSet, rowClues, colClues }, setGame] = useState(generate);

  return (
    <ToggleGridGame
      slug="amiral-batti"
      title="Amiral Battı"
      instructions="Satır ve sütun ipuçlarına göre gemi hücrelerine tıklayarak filoyu yerleştir (3'lük, 2'lik ve iki adet 1'lik gemi)."
      rows={5}
      cols={5}
      solutionSet={solutionSet}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="🚢"
      onRegenerate={() => setGame(generate())}
    />
  );
}
