import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { shuffle } from "../common/latinSquare";

function generateGrid() {
  return shuffle(Array.from({ length: 16 }, (_, i) => i + 1));
}

export default function Numbers() {
  const [grid, setGrid] = useState(generateGrid);
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

  function newGame() {
    setGrid(generateGrid());
    setNext(1);
    setWrongCell(null);
    setStatus("playing");
    setSeconds(0);
  }

  function handleClick(value) {
    if (status !== "playing") return;
    if (value === next) {
      if (next === 16) {
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
      <h1 className="text-2xl font-bold mb-1">Numbers</h1>
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        1'den 16'ya kadar sayılara sırayla, olabildiğince hızlı tıkla.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} — Sırada: {status === "playing" ? next : "-"}
      </p>

      <div className="grid grid-cols-4 gap-1">
        {grid.map((value) => {
          const done = value < next;
          const isWrong = wrongCell === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              disabled={done || status !== "playing"}
              className={[
                "w-14 h-14 text-lg font-bold rounded border border-slate-300",
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
        onClick={newGame}
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
