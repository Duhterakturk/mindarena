import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { shuffle } from "../common/latinSquare";
import DifficultyPicker from "../../components/games/DifficultyPicker";

const SIZE_BY_DIFFICULTY = { easy: 4, medium: 5, hard: 6 };
const CELL_SIZE = { 4: "w-14 h-14 text-lg", 5: "w-12 h-12 text-base", 6: "w-10 h-10 text-sm" };

function generateGrid(difficulty) {
  const n = SIZE_BY_DIFFICULTY[difficulty] || 4;
  const total = n * n;
  return { values: shuffle(Array.from({ length: total }, (_, i) => i + 1)), size: n, total };
}

export default function Numbers() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ values, size, total }, setGrid] = useState(() => generateGrid("easy"));
  const [next, setNext] = useState(1);
  const [wrongCell, setWrongCell] = useState(null);
  const [status, setStatus] = useState("playing"); // playing | correct | submitted
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("numbers")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  function newGame(nextDifficulty) {
    const d = nextDifficulty || difficulty;
    setDifficulty(d);
    setGrid(generateGrid(d));
    setNext(1);
    setWrongCell(null);
    setStatus("playing");
    setSeconds(0);
  }

  function handleClick(value) {
    if (status !== "playing") return;
    if (value === next) {
      if (next === total) {
        setStatus("correct");
        clearInterval(timerRef.current);
      }
      setNext((n) => n + 1);
    } else {
      setWrongCell(value);
      setTimeout(() => setWrongCell(null), 300);
    }
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

  const cellSize = CELL_SIZE[size] || CELL_SIZE[4];

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Numbers</h1>
      <DifficultyPicker gameSlug="numbers" value={difficulty} onChange={newGame} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        1'den {total}'e kadar sayılara sırayla, olabildiğince hızlı tıkla.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} — Sırada: {status === "playing" ? next : "-"}
      </p>

      <div
        className="inline-grid gap-1 max-w-full"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {values.map((value) => {
          const done = value < next;
          const isWrong = wrongCell === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              disabled={done || status !== "playing"}
              className={[
                cellSize,
                "font-bold rounded border border-slate-300",
                done ? "bg-emerald-500 text-white" : "bg-white hover:bg-brand-50",
                isWrong ? "bg-red-400 text-white" : "",
              ].join(" ")}
            >
              {value}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => newGame()}
        className="mt-4 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
      >
        Yeni Bulmaca
      </button>

      {status === "correct" && (
        <>
          <p className="text-emerald-600 mt-4">Tebrikler, hepsini sırayla buldun!</p>
          <button
            onClick={handleSubmitScore}
            className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            Skoru Kaydet
          </button>
        </>
      )}
      {status === "submitted" && <p className="text-emerald-600 mt-3">Skor kaydedildi.</p>}
    </div>
  );
}
