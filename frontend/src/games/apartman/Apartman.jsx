import { Fragment, useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

function cloneBoard(grid) {
  return grid.map((row) => [...row]);
}

export default function Apartman() {
  const copy = useGameText("apartman");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("apartman", difficulty);
  const puzzle = issue?.puzzle?.givens || null;
  const clues = issue?.puzzle?.clues;
  const attemptId = issue?.id;
  const givenMask = puzzle ? puzzle.map((row) => row.map((v) => v !== 0)) : [];
  const size = puzzle ? puzzle.length : 4;

  const [board, setBoard] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!puzzle) return;
    setBoard(cloneBoard(puzzle));
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  function handleDifficultyChange(newDifficulty) {
    if (newDifficulty !== difficulty) setDifficulty(newDifficulty);
    else reload();
  }

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const digit = value.replace(/[^1-4]/g, "").slice(-1);
    const next = cloneBoard(board);
    next[row][col] = digit ? Number(digit) : 0;
    setBoard(next);
    setStatus("playing");
  }

  async function checkSolution() {
    if (!attemptId) return;
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

  const clueCell = "w-12 h-12 flex items-center justify-center text-sm font-bold text-brand-700";

  if (phase !== "ready" || !board || !clues) return <PuzzlePending phase={phase} />;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="apartman" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div
        className="inline-grid max-w-full overflow-x-auto"
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

      {status === "correct" && <p className="text-emerald-600 mt-3">{play.correct}</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">{play.incorrectCells}</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
