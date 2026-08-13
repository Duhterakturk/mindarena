import { Fragment, useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { generate } from "./puzzles";

function cloneBoard(grid) {
  return grid.map((row) => [...row]);
}

export default function Carpmaca() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ rowHeaders, colHeaders, puzzle, solution }, setGame] = useState(() => generate("easy"));
  const givenMask = puzzle.map((row) => row.map((v) => v !== 0));

  const [board, setBoard] = useState(() => cloneBoard(puzzle));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("carpmaca")
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

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setGame(generate(newDifficulty));
  }

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const digits = value.replace(/[^0-9]/g, "").slice(0, 3);
    const next = cloneBoard(board);
    next[row][col] = digits ? Number(digits) : 0;
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
        difficulty,
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  const headerCell = "w-12 h-12 flex items-center justify-center text-sm font-bold bg-slate-800 text-white";

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Çarpmaca</h1>
      <DifficultyPicker gameSlug="carpmaca" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Her hücreye, bulunduğu satır ve sütun başlığının çarpımını yaz.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div
        className="inline-grid max-w-full overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${colHeaders.length + 1}, minmax(0, 1fr))` }}
      >
        <div className={headerCell}>×</div>
        {colHeaders.map((v, i) => (
          <div key={`ch-${i}`} className={headerCell}>{v}</div>
        ))}

        {board.map((row, r) => (
          <Fragment key={r}>
            <div key={`rh-${r}`} className={headerCell}>{rowHeaders[r]}</div>
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
          </Fragment>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          Kontrol Et
        </button>
        <button
          onClick={() => setGame(generate(difficulty))}
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
