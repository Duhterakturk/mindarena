import { useEffect, useMemo, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export default function Sudoku() {
  const copy = useGameText("sudoku");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("sudoku", difficulty);
  const puzzle = issue?.puzzle?.givens || null;
  const attemptId = issue?.id;
  const givenMask = useMemo(() => (puzzle ? puzzle.map((row) => row.map((v) => v !== 0)) : []), [puzzle]);

  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!puzzle) return;
    setBoard(cloneBoard(puzzle));
    setStatus("playing");
    setSelected(null);
    clearInterval(timerRef.current);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  function newPuzzle(nextDifficulty) {
    if (nextDifficulty && nextDifficulty !== difficulty) setDifficulty(nextDifficulty);
    else reload();
  }

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const digit = value.replace(/[^1-9]/g, "").slice(-1);
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

  if (phase !== "ready" || !board) return <PuzzlePending phase={phase} />;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>

      <DifficultyPicker gameSlug="sudoku" value={difficulty} onChange={newPuzzle} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

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
          {play.check}
        </button>
        <button
          onClick={() => newPuzzle()}
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
