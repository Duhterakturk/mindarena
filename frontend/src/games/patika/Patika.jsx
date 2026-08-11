import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function Patika() {
  const [{ solutionSet, fixedCells, rows, cols }, setGame] = useState(generate);

  return (
    <ToggleGridGame
      slug="patika"
      title="Patika"
      instructions="1'den 4'e kadar numaralı noktaları, yatay/dikey adımlarla kesintisiz bir yol oluşturacak şekilde birleştir."
      rows={rows}
      cols={cols}
      solutionSet={solutionSet}
      fixedCells={fixedCells}
      markSymbol="•"
      onRegenerate={() => setGame(generate())}
    />
  );
}
