import { useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

function emptyBoard(grid) {
  return grid.map((row) => row.map((cell) => (cell.type === "white" && cell.given ? cell.given : 0)));
}

function cellSizeClass(size) {
  if (size >= 8) return "w-9 h-9 text-sm";
  if (size >= 6) return "w-11 h-11";
  return "w-14 h-14 text-lg";
}

export default function Kakuro() {
  const copy = useGameText("kakuro");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("kakuro", difficulty);
  const puzzle = issue?.puzzle || null;
  const grid = puzzle?.grid;
  const size = puzzle?.size;
  const attemptId = issue?.id;
  const [board, setBoard] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const [renderedPuzzle, setRenderedPuzzle] = useState(null);
  let displayBoard = board;
  if (puzzle && puzzle !== renderedPuzzle) {
    displayBoard = emptyBoard(grid);
    setRenderedPuzzle(puzzle);
    setBoard(displayBoard);
    setStatus("playing");
  }

  useEffect(() => {
    setSeconds(0);
    clearInterval(timerRef.current);
    if (!attemptId) return undefined;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  function handleDifficultyChange(newDifficulty) {
    if (newDifficulty !== difficulty) setDifficulty(newDifficulty);
    else reload();
  }

  function handleCellChange(row, col, value) {
    if (status === "correct" || grid[row][col].given) return;
    const digit = value.replace(/[^1-9]/g, "").slice(-1);
    const next = displayBoard.map((r) => [...r]);
    next[row][col] = digit ? Number(digit) : 0;
    setBoard(next);
    setStatus("playing");
  }

  function answerGrid() {
    return displayBoard.slice(1).map((row) => row.slice(1));
  }

  async function checkSolution() {
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, answerGrid());
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: answerGrid() });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready" || !displayBoard || !grid) return <PuzzlePending phase={phase} />;

  const cellSize = cellSizeClass(size);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="kakuro" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

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
                value={displayBoard[r][c] || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={status === "correct" || Boolean(cell.given)}
                className={[
                  cellSize,
                  "text-center border border-slate-300 focus:outline-none focus:bg-brand-100",
                  cell.given ? "bg-slate-100 font-bold text-slate-700" : "bg-white",
                ].join(" ")}
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
          {play.check}
        </button>
        <button
          onClick={reload}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
        >
          {play.newPuzzle}
        </button>
        {status === "correct" && (
          <button
            onClick={handleSubmitScore}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            {play.save}
          </button>
        )}
      </div>

      {status === "correct" && <p className="play-correct text-emerald-600 mt-3">{play.correct}</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">{play.incorrectCells}</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
