import { useEffect, useMemo, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { generateSudokuSolution, carvePuzzle, DIFFICULTY_LEVELS } from "../common/latinSquare";

const GIVENS_BY_DIFFICULTY = { easy: 40, medium: 32, hard: 26 };

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function makePuzzle(difficulty) {
  const solution = generateSudokuSolution();
  const puzzle = carvePuzzle(solution, GIVENS_BY_DIFFICULTY[difficulty]);
  return { puzzle, solution };
}

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ puzzle, solution }, setGame] = useState(() => makePuzzle("easy"));
  const givenMask = useMemo(() => puzzle.map((row) => row.map((v) => v !== 0)), [puzzle]);

  const [board, setBoard] = useState(() => cloneBoard(puzzle));
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("playing"); // playing | correct | incorrect | submitted
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("sudoku")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [puzzle]);

  function newPuzzle(nextDifficulty) {
    const d = nextDifficulty || difficulty;
    setDifficulty(d);
    const generated = makePuzzle(d);
    setGame(generated);
    setBoard(cloneBoard(generated.puzzle));
    setStatus("playing");
    setSelected(null);
  }

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const digit = value.replace(/[^1-9]/g, "").slice(-1);
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
        difficulty,
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Sudoku</h1>

      <div className="flex gap-2 mb-2">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => newPuzzle(key)}
            className={[
              "px-3 py-1 rounded-full text-xs font-semibold border",
              difficulty === key
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-slate-600 border-slate-300 hover:bg-brand-50",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div className="grid grid-cols-9 border-2 border-slate-700">
        {board.map((row, r) =>
          row.map((val, c) => (
            <input
              key={`${r}-${c}`}
              value={val || ""}
              onFocus={() => setSelected([r, c])}
              onChange={(e) => handleCellChange(r, c, e.target.value)}
              readOnly={givenMask[r][c]}
              className={[
                "w-9 h-9 text-center text-lg border border-slate-300 focus:outline-none focus:bg-brand-100",
                givenMask[r][c] ? "bg-slate-100 font-bold text-slate-700" : "bg-white",
                c % 3 === 2 && c !== 8 ? "border-r-2 border-r-slate-700" : "",
                r % 3 === 2 && r !== 8 ? "border-b-2 border-b-slate-700" : "",
                selected && selected[0] === r && selected[1] === c ? "ring-2 ring-brand-400" : "",
              ].join(" ")}
            />
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
        <button
          onClick={() => newPuzzle()}
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
