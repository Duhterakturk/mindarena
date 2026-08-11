import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

export default function YildizSavaslari() {
  const [{ solutionSet, rowClues, colClues }, setGame] = useState(generate);

  return (
    <ToggleGridGame
      slug="yildiz-savaslari"
      title="Yıldız Savaşları"
      instructions="Her satıra ve her sütuna tam olarak bir yıldız yerleştir. İki yıldız, yatay/dikey/çapraz komşu olamaz."
      rows={5}
      cols={5}
      solutionSet={solutionSet}
      rowClues={rowClues}
      colClues={colClues}
      markSymbol="★"
      onRegenerate={() => setGame(generate())}
    />
  );
}
