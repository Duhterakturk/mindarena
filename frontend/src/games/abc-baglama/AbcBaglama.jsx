import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function AbcBaglama() {
  const [{ solutionSet, fixedCells, rows, cols }, setGame] = useState(generate);

  return (
    <ToggleGridGame
      slug="abc-baglama"
      title="ABC Bağlama"
      instructions="Aynı harfe sahip hücreleri, birbirini kesmeyen yatay/dikey bir çizgiyle birleştir."
      rows={rows}
      cols={cols}
      solutionSet={solutionSet}
      fixedCells={fixedCells}
      markSymbol="—"
      onRegenerate={() => setGame(generate())}
    />
  );
}
