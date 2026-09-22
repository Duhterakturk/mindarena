import { useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

function cloneRows(rows) {
  return rows.map((row) => [...row]);
}

export default function SihirliPiramit() {
  const copy = useGameText("sihirli-piramit");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("sihirli-piramit", difficulty);
  const puzzle = issue?.puzzle?.rows || null;
  const attemptId = issue?.id;
  const givenMask = puzzle ? puzzle.map((row) => row.map((v) => v !== 0)) : [];

  const [board, setBoard] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const [renderedPuzzle, setRenderedPuzzle] = useState(null);
  let displayBoard = board;
  if (puzzle && puzzle !== renderedPuzzle) {
    displayBoard = cloneRows(puzzle);
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
    if (givenMask[row][col] || status === "correct") return;
    const digits = value.replace(/[^0-9]/g, "").slice(0, 3);
    const next = cloneRows(displayBoard);
    next[row][col] = digits ? Number(digits) : 0;
    setBoard(next);
    setStatus("playing");
  }

  async function checkSolution() {
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, displayBoard);
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: displayBoard });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready" || !displayBoard) return <PuzzlePending phase={phase} />;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="sihirli-piramit" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div className="flex flex-col items-center gap-1 max-w-full overflow-x-auto">
        {displayBoard.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((val, c) => (
              <input
                key={c}
                value={val || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={givenMask[r][c] || status === "correct"}
                className={[
                  "w-12 h-12 text-center text-base border border-slate-300 focus:outline-none focus:bg-brand-100",
                  givenMask[r][c] ? "bg-slate-100 font-bold text-slate-700" : "bg-white",
                ].join(" ")}
              />
            ))}
          </div>
        ))}
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
