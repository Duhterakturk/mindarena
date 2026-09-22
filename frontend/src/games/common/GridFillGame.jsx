import { useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "./gameText";
import { usePlayCopy } from "./playCopy";

function cloneBoard(grid) {
  return grid.map((row) => [...row]);
}

function cellSizeClass(gridWidth) {
  if (gridWidth >= 8) return "w-8 h-8 text-sm";
  if (gridWidth >= 6) return "w-10 h-10";
  return "w-12 h-12 text-lg";
}

/**
 * Satır/sütun tabanlı, hücre doldurmalı oyunlar için paylaşılan iskelet
 * (Bölgesel Sudoku, İşlem Karesi, Kendoku, Futoshiki). Apartman ve Çarpmaca,
 * kenar/başlık satırları gerektirdiğinden bu bileşeni kullanmaz. Her oyun
 * yalnızca kendi `puzzle`/`solution` verisini ve isteğe bağlı hücre üstü
 * ipucu render'ını (`renderOverlay`) sağlar.
 */
export default function GridFillGame({
  slug,
  puzzle,
  attemptId,
  maxDigit = 9,
  cellClassName,
  renderOverlay,
  instructions,
  onRegenerate,
  difficulty,
  onDifficultyChange,
}) {
  const copy = useGameText(slug, { n: puzzle.length });
  const play = usePlayCopy();
  const blurb = instructions || copy.rules;
  const givenMask = puzzle.map((row) => row.map((v) => v !== 0));
  const cellSize = cellSizeClass(puzzle[0].length);
  const [board, setBoard] = useState(() => cloneBoard(puzzle));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // `puzzle` referansı değiştiğinde (ör. zorluk değişimiyle ızgara boyutu
  // büyüdüğünde) `board`'u render SIRASINDA senkron olarak sıfırlarız (React'ın
  // "prop değiştiğinde state sıfırlama" deseni). `setBoard` çağrısı yalnızca
  // BİR SONRAKİ render'ı düzeltir — BU render'ın JSX'i hâlâ eski (küçük)
  // `board` ile yeni (büyük) `puzzle`'ı birlikte kullanmaya çalışıp çökerdi
  // (canlı testte yakalandı). Bu yüzden bu render'da kullanılacak güvenli
  // değeri `displayBoard` içinde tutuyoruz.
  const [renderedPuzzle, setRenderedPuzzle] = useState(puzzle);
  let displayBoard = board;
  if (puzzle !== renderedPuzzle) {
    displayBoard = cloneBoard(puzzle);
    setRenderedPuzzle(puzzle);
    setBoard(displayBoard);
    setStatus("playing");
  }

  // Süreyi de `puzzle` değiştiğinde sıfırla (şekil-bağımsız, bu yüzden
  // gecikmeli bir efekt burada güvenlidir).
  useEffect(() => {
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [puzzle]);

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const re = new RegExp(`[^1-${maxDigit}]`, "g");
    const digit = value.replace(re, "").slice(-1);
    const next = cloneBoard(displayBoard);
    next[row][col] = digit ? Number(digit) : 0;
    setBoard(next);
    setStatus("playing");
  }

  async function checkSolution() {
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, displayBoard);
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({
        attempt_id: attemptId,
        answer: displayBoard,
      });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      {onDifficultyChange && (
        <DifficultyPicker gameSlug={slug} value={difficulty} onChange={onDifficultyChange} />
      )}
      {blurb && <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{blurb}</p>}
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div
        className="inline-grid border-2 border-slate-700 max-w-full overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${puzzle[0].length}, minmax(0, 1fr))` }}
      >
        {displayBoard.map((row, r) =>
          row.map((val, c) => (
            <div key={`${r}-${c}`} className="relative">
              <input
                value={val || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={givenMask[r][c] || status === "correct"}
                className={[
                  cellSize,
                  "text-center border border-slate-300 focus:outline-none focus:bg-brand-100",
                  givenMask[r][c] ? "bg-slate-100 font-bold text-slate-700" : "bg-white",
                  cellClassName ? cellClassName(r, c) : "",
                ].join(" ")}
              />
              {renderOverlay && renderOverlay(r, c)}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {play.check}
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
          >
            {play.newPuzzle}
          </button>
        )}
        {status === "correct" && (
          <button
            onClick={handleSubmitScore}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            {play.save}
          </button>
        )}
      </div>

      {status === "correct" && <p className="text-emerald-600 mt-3">{play.correct}</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">{play.incorrectCells}</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
