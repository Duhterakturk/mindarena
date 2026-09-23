import { useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import ClearBoardButton from "../common/ClearBoardButton";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useApplyCellHint, writeFill } from "../common/cellHint";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function clone(grid) {
  return grid.map((row) => row.slice());
}

function StarCard({ clue, size }) {
  const marked = new Set(clue.cells);
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center">
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${size}, 0.7rem)` }}>
        {Array.from({ length: size * size }, (_, index) => {
          const key = `${Math.floor(index / size)}-${index % size}`;
          return (
            <div key={key} className="w-2.5 h-2.5 border border-slate-300 bg-white text-[8px] leading-[0.7rem] text-slate-900">
              {marked.has(key) ? "★" : ""}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-xs font-bold text-slate-900">{clue.text}</p>
    </div>
  );
}

export default function Numbers() {
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("numbers", difficulty);
  const puzzle = issue?.puzzle;
  const givens = puzzle?.givens;
  const copy = useGameText("numbers");
  const play = usePlayCopy();
  const attemptId = issue?.id;
  const [board, setBoard] = useState(null);
  const [digit, setDigit] = useState(1);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!givens) return undefined;
    setBoard(clone(givens));
    setDigit(1);
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId, givens]);

  useApplyCellHint(attemptId, (hint) => {
    writeFill(setBoard, hint);
    setStatus("playing");
  });

  function newGame(next) {
    if (next && next !== difficulty) setDifficulty(next);
    else reload();
  }

  function write(row, col) {
    if (!board || givens[row][col] || status === "correct" || status === "submitted") return;
    const next = clone(board);
    next[row][col] = digit || 0;
    setBoard(next);
    setStatus("playing");
  }

  async function checkSolution() {
    if (!attemptId || !board) return;
    try {
      const correct = await checkPuzzle(attemptId, board);
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: board });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready" || !board || !puzzle?.clues) return <PuzzlePending phase={phase} />;

  const size = board.length;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="numbers" value={difficulty} onChange={newGame} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-4">
        {puzzle.clues.map((clue, index) => (
          <StarCard key={`${clue.text}-${index}`} clue={clue} size={size} />
        ))}
      </div>

      <div className="inline-grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${size}, 3rem)` }}>
        {board.map((row, rowIndex) => row.map((value, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            type="button"
            onClick={() => write(rowIndex, colIndex)}
            className={`w-12 h-12 border border-slate-400 bg-white text-xl font-bold text-slate-900 ${givens[rowIndex][colIndex] ? "bg-slate-100" : ""}`}
          >
            {value || ""}
          </button>
        )))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {DIGITS.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => setDigit(number)}
            className={`w-9 h-9 rounded-lg border font-bold ${digit === number ? "bg-brand-500 text-white border-brand-500" : "bg-white text-slate-800 border-slate-300"}`}
          >
            {number}
          </button>
        ))}
        <button type="button" onClick={() => setDigit(0)} className="w-9 h-9 rounded-lg border border-slate-300 bg-white font-bold text-slate-700">✕</button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={checkSolution} className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold">{play.check}</button>
        <ClearBoardButton onClick={() => { setBoard(clone(givens)); setStatus("playing"); }} />
        <button type="button" onClick={() => newGame()} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold">{play.newPuzzle}</button>
        {status === "correct" && (
          <button type="button" onClick={handleSubmitScore} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold">{play.save}</button>
        )}
      </div>
      {status === "correct" && <p className="text-emerald-600 mt-3">{play.correct}</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">{play.incorrect}</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
