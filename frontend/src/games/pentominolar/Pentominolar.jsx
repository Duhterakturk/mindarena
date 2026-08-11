import { useState } from "react";
import ToggleGridGame from "../common/ToggleGridGame";
import { generate } from "./puzzles";

function ShapePreview({ shape }) {
  const maxR = Math.max(...shape.map(([r]) => r)) + 1;
  const maxC = Math.max(...shape.map(([, c]) => c)) + 1;
  const cells = new Set(shape.map(([r, c]) => `${r}-${c}`));

  return (
    <div className="mb-4">
      <p className="text-xs text-slate-500 mb-1 text-center">Hedef şekil:</p>
      <div
        className="inline-grid gap-0.5 bg-slate-100 p-1 rounded"
        style={{ gridTemplateColumns: `repeat(${maxC}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: maxR }).map((_, r) =>
          Array.from({ length: maxC }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-6 h-6 ${cells.has(`${r}-${c}`) ? "bg-brand-500" : "bg-transparent"}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function Pentominolar() {
  const [{ shape, solutionSet, gridSize }, setGame] = useState(generate);

  return (
    <ToggleGridGame
      slug="pentominolar"
      title="Pentominolar"
      instructions="Yukarıdaki şekli oluşturan 5 hücreyi tıklayarak seç."
      rows={gridSize}
      cols={gridSize}
      solutionSet={solutionSet}
      markSymbol="■"
      extra={<ShapePreview shape={shape} />}
      onRegenerate={() => setGame(generate())}
    />
  );
}
