import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";

function cloneBoard(grid) {
  return grid.map((row) => [...row]);
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
  title,
  puzzle,
  solution,
  maxDigit = 9,
  cellClassName,
  renderOverlay,
  instructions,
  onRegenerate,
}) {
  const givenMask = puzzle.map((row) => row.map((v) => v !== 0));
  const [board, setBoard] = useState(() => cloneBoard(puzzle));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame(slug)
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, [slug]);

  // `puzzle` referansı değiştiğinde (ör. "Yeni Bulmaca") tahtayı ve durumu sıfırla.
  useEffect(() => {
    setBoard(cloneBoard(puzzle));
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [puzzle]);

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const re = new RegExp(`[^1-${maxDigit}]`, "g");
    const digit = value.replace(re, "").slice(-1);
    const next = cloneBoard(board);
    next[row][col] = digit ? Number(digit) : 0;
    setBoard(next);
    setStatus("playing");
  }

  function checkSolution() {
    const isCorrect = board.every((row, r) => row.every((val, c) => val === solution[r][c]));
    setStatus(isCorrect ? "correct" : "incorrect");
    if (isCorrect) clearInterval(timerRef.current);
  }

  async function handleSubmitScore() {
    if (!gameId) return;
    try {
      await submitScore({
        game_id: gameId,
        points: Math.max(1000 - seconds, 100),
        duration_seconds: seconds,
        difficulty: "easy",
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      {instructions && <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{instructions}</p>}
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div
        className="inline-grid border-2 border-slate-700"
        style={{ gridTemplateColumns: `repeat(${puzzle[0].length}, minmax(0, 1fr))` }}
      >
        {board.map((row, r) =>
          row.map((val, c) => (
            <div key={`${r}-${c}`} className="relative">
              <input
                value={val || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={givenMask[r][c] || status === "correct"}
                className={[
                  "w-12 h-12 text-center text-lg border border-slate-300 focus:outline-none focus:bg-brand-100",
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
          Kontrol Et
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
          >
            Yeni Bulmaca
          </button>
        )}
        {status === "correct" && (
          <button
            onClick={handleSubmitScore}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            Skoru Kaydet
          </button>
        )}
      </div>

      {status === "correct" && <p className="text-emerald-600 mt-3">Tebrikler, doğru çözdün!</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">Bazı hücreler yanlış, tekrar dene.</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">Skor kaydedildi.</p>}
    </div>
  );
}
