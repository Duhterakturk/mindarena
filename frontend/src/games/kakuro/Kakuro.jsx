import { useEffect, useRef, useState } from "react";
import { scoreStatus } from "../../api/client";
import { checkPuzzle, submitScore } from "../../api/games";
import ClearBoardButton from "../common/ClearBoardButton";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { useApplyCellHint, writeFill } from "../common/cellHint";
import NotesOverlay from "../common/NotesOverlay";
import NotesToggle from "../common/NotesToggle";
import { clearCellNotes, emptyNotes, toggleNote } from "../common/pencilNotes";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

function emptyBoard(grid) {
  return grid.map((row) => row.map((cell) => (cell.type === "white" && cell.given ? cell.given : 0)));
}

function cellPixels(size) {
  if (size >= 8) return 40;
  if (size >= 7) return 44;
  return 48;
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
  const [notes, setNotes] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const [renderedPuzzle, setRenderedPuzzle] = useState(null);
  let displayBoard = board;
  let displayNotes = notes;
  if (puzzle && puzzle !== renderedPuzzle) {
    displayBoard = emptyBoard(grid);
    displayNotes = emptyNotes(grid.length, grid[0].length);
    setRenderedPuzzle(puzzle);
    setBoard(displayBoard);
    setNotes(displayNotes);
    setNotesMode(false);
    setStatus("playing");
  }

  useEffect(() => {
    setSeconds(0);
    clearInterval(timerRef.current);
    if (!attemptId) return undefined;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  useApplyCellHint(attemptId, (hint) => {
    writeFill(setBoard, hint);
    if (hint?.kind === "fill") {
      setNotes((prev) => (prev ? clearCellNotes(prev, hint.row, hint.col) : prev));
    }
  });

  function handleDifficultyChange(newDifficulty) {
    if (newDifficulty !== difficulty) setDifficulty(newDifficulty);
    else reload();
  }

  function clearBoard() {
    if (!grid) return;
    setBoard(emptyBoard(grid));
    setNotes(emptyNotes(grid.length, grid[0].length));
    setStatus("playing");
  }

  function handleCellChange(row, col, value) {
    if (status === "correct" || grid[row][col].given) return;
    const digit = value.replace(/[^1-9]/g, "").slice(-1);
    if (notesMode) {
      if (!digit) return;
      setBoard((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = 0;
        return next;
      });
      setNotes((prev) => toggleNote(prev, row, col, Number(digit)));
      setStatus("playing");
      return;
    }
    const next = displayBoard.map((r) => [...r]);
    next[row][col] = digit ? Number(digit) : 0;
    setBoard(next);
    setNotes((prev) => clearCellNotes(prev, row, col));
    setStatus("playing");
  }

  function answerGrid() {
    return grid.map((row, r) => row.map((cell, c) => (cell.type === "white" ? displayBoard[r][c] || 0 : null)));
  }

  async function checkSolution() {
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, answerGrid());
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch (error) {
      setStatus(scoreStatus(error));
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: answerGrid() });
      setStatus("submitted");
    } catch (error) {
      setStatus(scoreStatus(error));
    }
  }

  if (phase !== "ready" || !displayBoard || !displayNotes || !grid) return <PuzzlePending phase={phase} />;

  const cell = cellPixels(size);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="kakuro" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-xs mb-2 max-w-md text-center">{play.notesHint}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div
        className="inline-grid max-w-full border-2 border-[#243024]"
        data-testid="kakuro-board"
        style={{ gridTemplateColumns: `repeat(${size}, ${cell}px)` }}
      >
        {grid.map((row, r) =>
          row.map((item, c) => {
            if (item.type === "clue") {
              return (
                <div key={`${r}-${c}`} className="relative border border-[#6d8a6d]" style={{ width: cell, height: cell, background: "#cfe3cf" }}>
                  <svg viewBox="0 0 10 10" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                    <line x1="0" y1="0" x2="10" y2="10" stroke="#243024" strokeWidth="0.18" />
                  </svg>
                  {item.right != null && (
                    <span className="absolute top-0.5 right-0.5 text-[11px] font-bold leading-none text-slate-900">{item.right}</span>
                  )}
                  {item.down != null && (
                    <span className="absolute bottom-0.5 left-0.5 text-[11px] font-bold leading-none text-slate-900">{item.down}</span>
                  )}
                </div>
              );
            }
            if (item.type !== "white") {
              return <div key={`${r}-${c}`} style={{ width: cell, height: cell, background: "#4a4a4a" }} />;
            }
            return (
              <div key={`${r}-${c}`} className="relative" style={{ width: cell, height: cell, background: item.given ? "#f1f5f9" : "#fff" }}>
                <input
                  aria-label={`${r + 1}-${c + 1}`}
                  value={displayBoard[r][c] || ""}
                  onChange={(e) => handleCellChange(r, c, e.target.value)}
                  readOnly={status === "correct" || Boolean(item.given)}
                  inputMode="numeric"
                  className={[
                    "relative z-10 h-full w-full border border-slate-300 bg-transparent text-center text-base font-semibold text-slate-900 focus:outline-none focus:bg-brand-100",
                    item.given ? "font-bold" : "",
                  ].join(" ")}
                />
                {!displayBoard[r][c] && !item.given && (
                  <NotesOverlay digits={displayNotes[r][c]} maxDigit={9} />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {play.check}
        </button>
        <NotesToggle
          on={notesMode}
          onClick={() => setNotesMode((value) => !value)}
          label={notesMode ? play.notesOn : play.notes}
          hint={play.notesHint}
        />
        <ClearBoardButton onClick={clearBoard} />
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
      {status === "offline" && (
        <div className="mt-3 text-center">
          <p className="text-[#f4efe6]">{play.offline}</p>
          <button type="button" className="mt-2 text-sm font-semibold underline" onClick={handleSubmitScore}>{play.retry}</button>
        </div>
      )}
    </div>
  );
}
