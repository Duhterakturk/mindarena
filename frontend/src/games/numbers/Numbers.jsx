import { useEffect, useRef, useState } from "react";
import { submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

const CELL_SIZE = { 4: "w-14 h-14 text-lg", 5: "w-12 h-12 text-base", 6: "w-10 h-10 text-sm" };

export default function Numbers() {
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("numbers", difficulty);
  const values = issue?.puzzle?.values || [];
  const total = values.length;
  const size = Math.round(Math.sqrt(total || 1));
  const attemptId = issue?.id;
  const copy = useGameText("numbers", { total });
  const [next, setNext] = useState(1);
  const [wrongCell, setWrongCell] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!attemptId) return undefined;
    setNext(1);
    setWrongCell(null);
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  function newGame(nextDifficulty) {
    if (nextDifficulty && nextDifficulty !== difficulty) setDifficulty(nextDifficulty);
    else reload();
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
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: { done: true } });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready" || values.length === 0) return <PuzzlePending phase={phase} />;

  const cellSize = CELL_SIZE[size] || CELL_SIZE[4];

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="numbers" value={difficulty} onChange={newGame} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">
        {play.clock(seconds)} — {play.next(status === "playing" ? next : "-")}
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
        {play.newPuzzle}
      </button>

      {status === "correct" && (
        <>
          <p className="play-correct text-emerald-600 mt-4">{play.numbersDone}</p>
          <button
            onClick={handleSubmitScore}
            className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            {play.save}
          </button>
        </>
      )}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
