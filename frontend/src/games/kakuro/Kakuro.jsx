import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { GRID_SHAPE, generateKakuroSolution } from "./puzzles";

function buildGrid(solution) {
  const grid = GRID_SHAPE.map((row) => row.map((type) => ({ type })));
  for (let c = 1; c <= 4; c++) {
    const colSum = solution.reduce((sum, row) => sum + row[c - 1], 0);
    grid[0][c].clueDown = colSum;
  }
  for (let r = 1; r <= 4; r++) {
    const rowSum = solution[r - 1].reduce((a, b) => a + b, 0);
    grid[r][0].clueRight = rowSum;
  }
  const fullSolution = grid.map((row, r) =>
    row.map((cell, c) => (cell.type === "white" ? solution[r - 1][c - 1] : null))
  );
  return { grid, fullSolution };
}

function emptyBoard() {
  return GRID_SHAPE.map((row) => row.map(() => 0));
}

function generate() {
  const solution = generateKakuroSolution();
  const { grid, fullSolution } = buildGrid(solution);
  return { grid, fullSolution };
}

export default function Kakuro() {
  const [{ grid, fullSolution }, setPuzzle] = useState(generate);
  const [board, setBoard] = useState(emptyBoard);
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
    setBoard(emptyBoard());
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [grid]);

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
      <h1 className="text-2xl font-bold mb-1">Kakuro</h1>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div className="inline-grid grid-cols-5 border-2 border-slate-700">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            if (cell.type === "corner") {
              return <div key={`${r}-${c}`} className="w-14 h-14 bg-slate-800" />;
            }
            if (cell.type === "block") {
              return (
                <div
                  key={`${r}-${c}`}
                  className="w-14 h-14 bg-slate-800 relative text-[10px] font-semibold text-white border border-slate-600"
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
                className="w-14 h-14 text-center text-lg border border-slate-300 bg-white focus:outline-none focus:bg-brand-100"
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
          onClick={() => setPuzzle(generate())}
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
