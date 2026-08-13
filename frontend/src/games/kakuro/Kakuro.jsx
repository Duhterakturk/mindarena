import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { generate } from "./puzzles";

function emptyBoard(size) {
  return Array.from({ length: size + 1 }, () => Array(size + 1).fill(0));
}

function cellSizeClass(size) {
  if (size >= 8) return "w-9 h-9 text-sm";
  if (size >= 6) return "w-11 h-11";
  return "w-14 h-14 text-lg";
}

export default function Kakuro() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ grid, fullSolution, size }, setPuzzle] = useState(() => generate("easy"));
  const [board, setBoard] = useState(() => emptyBoard(size));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("kakuro")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setBoard(emptyBoard(size));
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [grid, size]);

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setPuzzle(generate(newDifficulty));
  }

  function handleCellChange(row, col, value) {
    if (status === "correct") return;
    const digit = value.replace(/[^1-9]/g, "").slice(-1);
    const next = board.map((r) => [...r]);
    next[row][col] = digit ? Number(digit) : 0;
    setBoard(next);
    setStatus("playing");
  }

  function checkSolution() {
    const isCorrect = grid.every((row, r) =>
      row.every((cell, c) => cell.type !== "white" || board[r][c] === fullSolution[r][c])
    );
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
        difficulty,
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  const cellSize = cellSizeClass(size);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Kakuro</h1>
      <DifficultyPicker gameSlug="kakuro" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div
        className="inline-grid border-2 border-slate-700 max-w-full overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${size + 1}, minmax(0, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            if (cell.type === "corner") {
              return <div key={`${r}-${c}`} className={`${cellSize} bg-slate-800`} />;
            }
            if (cell.type === "block") {
              return (
                <div
                  key={`${r}-${c}`}
                  className={`${cellSize} bg-slate-800 relative text-[9px] font-semibold text-white border border-slate-600`}
                >
                  {cell.clueDown != null && (
                    <span className="absolute bottom-0.5 left-1">{cell.clueDown}</span>
                  )}
                  {cell.clueRight != null && (
                    <span className="absolute top-0.5 right-1">{cell.clueRight}</span>
                  )}
                </div>
              );
            }
            return (
              <input
                key={`${r}-${c}`}
                value={board[r][c] || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={status === "correct"}
                className={`${cellSize} text-center border border-slate-300 bg-white focus:outline-none focus:bg-brand-100`}
              />
            );
          })
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          Kontrol Et
        </button>
        <button
          onClick={() => setPuzzle(generate(difficulty))}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
        >
          Yeni Bulmaca
        </button>
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
