import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { generateLatinSquare, carvePuzzle } from "../common/latinSquare";
import { computeClues, GIVENS_COUNT } from "./puzzles";

function cloneBoard(grid) {
  return grid.map((row) => [...row]);
}

function generate() {
  const solution = generateLatinSquare(4);
  const puzzle = carvePuzzle(solution, GIVENS_COUNT);
  return { puzzle, solution };
}

export default function Apartman() {
  const [{ puzzle, solution }, setGame] = useState(generate);
  const clues = useMemo(() => computeClues(solution), [solution]);
  const givenMask = puzzle.map((row) => row.map((v) => v !== 0));
  const size = puzzle.length;

  const [board, setBoard] = useState(() => cloneBoard(puzzle));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("apartman")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

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
    const digit = value.replace(/[^1-4]/g, "").slice(-1);
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

  const clueCell = "w-12 h-12 flex items-center justify-center text-sm font-bold text-brand-700";

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Apartman</h1>
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Her satır ve sütun 1-4 bina yüksekliğini birer kez içermeli; kenar ipuçları o
        yönden kaç binanın görünür olduğunu gösterir.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div
        className="inline-grid"
        style={{ gridTemplateColumns: `repeat(${size + 2}, minmax(0, 1fr))` }}
      >
        <div className={clueCell} />
        {clues.top.map((v, i) => (
          <div key={`t-${i}`} className={clueCell}>{v}</div>
        ))}
        <div className={clueCell} />

        {board.map((row, r) => (
          <Fragment key={r}>
            <div key={`l-${r}`} className={clueCell}>{clues.left[r]}</div>
            {row.map((val, c) => (
              <input
                key={`${r}-${c}`}
                value={val || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={givenMask[r][c] || status === "correct"}
                className={[
                  "w-12 h-12 text-center text-lg border border-slate-300 focus:outline-none focus:bg-brand-100",
                  givenMask[r][c] ? "bg-slate-100 font-bold text-slate-700" : "bg-white",
                ].join(" ")}
              />
            ))}
            <div key={`r-${r}`} className={clueCell}>{clues.right[r]}</div>
          </Fragment>
        ))}

        <div className={clueCell} />
        {clues.bottom.map((v, i) => (
          <div key={`b-${i}`} className={clueCell}>{v}</div>
        ))}
        <div className={clueCell} />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          Kontrol Et
        </button>
        <button
          onClick={() => setGame(generate())}
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
