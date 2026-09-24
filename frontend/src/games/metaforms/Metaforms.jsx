import { useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import ClearBoardButton from "../common/ClearBoardButton";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { useApplyCellHint } from "../common/cellHint";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";
import { COLORS, SHAPES } from "./puzzles";

const INK = {
  red: "#e11d48",
  yellow: "#eab308",
  blue: "#2461f7",
};

function samePiece(a, b) {
  return Boolean(a && b && a.shape === b.shape && a.color === b.color);
}

function Glyph({ shape, color, size = 28 }) {
  const fill = color ? INK[color] : "none";
  const stroke = color ? INK[color] : "#1e1a16";
  if (!shape) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill={fill} />
      </svg>
    );
  }
  if (shape === "square") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="5" y="5" width="22" height="22" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  if (shape === "triangle") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,4 29,28 3,28" fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill={fill} stroke={stroke} strokeWidth="2.5" />
    </svg>
  );
}

function ClueCard({ clue }) {
  const yes = clue.sign === "yes";
  const region = new Set(clue.cells || []);
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 ${yes ? "border-emerald-500" : "border-rose-400"}`}>
      <Glyph shape={clue.shape} color={clue.color} size={26} />
      <span className={`text-sm font-bold leading-none ${yes ? "text-emerald-600" : "text-rose-500"}`}>{yes ? "✓" : "✕"}</span>
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }, (_, index) => {
          const key = `${Math.floor(index / 3)}-${index % 3}`;
          const on = region.has(key);
          return (
            <div
              key={key}
              className={`flex h-3 w-3 items-center justify-center border border-slate-300 text-[8px] font-bold leading-none ${on ? "clue-hatch" : "bg-white"} ${on && !yes ? "text-rose-500" : "text-transparent"}`}
            >
              {on && !yes ? "✕" : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PieceTray({ pieces, placed, selected, setSelected, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label ? <p className="text-xs font-semibold text-slate-500">{label}</p> : <p className="text-xs font-semibold text-transparent">.</p>}
      {pieces.map((piece) => {
        const used = placed.has(`${piece.shape}:${piece.color}`);
        const active = samePiece(selected, piece);
        return (
          <button
            key={`${piece.shape}-${piece.color}`}
            type="button"
            disabled={used}
            onClick={() => setSelected(active ? null : piece)}
            className={[
              "flex h-11 w-11 items-center justify-center rounded-lg border bg-white",
              used ? "opacity-30" : "",
              active ? "border-[#2461f7] ring-2 ring-[#2461f7]" : "border-slate-300",
            ].join(" ")}
          >
            <Glyph shape={piece.shape} color={piece.color} size={26} />
          </button>
        );
      })}
    </div>
  );
}

function emptyBoard() {
  return [0, 1, 2].map(() => [null, null, null]);
}

export default function Metaforms() {
  const copy = useGameText("metaforms");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("metaforms", difficulty);
  const clues = issue?.puzzle?.clues || [];
  const attemptId = issue?.id;
  const [board, setBoard] = useState(emptyBoard);
  const [selected, setSelected] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!attemptId) return undefined;
    setBoard(emptyBoard());
    setSelected(null);
    setHintCell(null);
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  useApplyCellHint(attemptId, (hint) => {
    if (hint.kind !== "form" || !hint.shape || !hint.color) return;
    const piece = { shape: hint.shape, color: hint.color };
    setBoard((prev) => {
      const next = prev.map((row) => row.slice());
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          if (samePiece(next[row][col], piece)) next[row][col] = null;
        }
      }
      next[hint.row][hint.col] = piece;
      return next;
    });
    setSelected(null);
    setHintCell(`${hint.row}-${hint.col}`);
    setStatus("playing");
  });

  function newGame(nextDifficulty) {
    if (nextDifficulty && nextDifficulty !== difficulty) setDifficulty(nextDifficulty);
    else reload();
  }

  function clearBoard() {
    setBoard(emptyBoard());
    setSelected(null);
    setHintCell(null);
    setStatus("playing");
  }

  function place(row, col) {
    if (status === "correct" || status === "submitted") return;
    const next = board.map((line) => line.slice());
    const current = next[row][col];
    if (!selected) {
      if (!current) return;
      next[row][col] = null;
      setSelected(current);
      setBoard(next);
      setStatus("playing");
      return;
    }
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (samePiece(next[r][c], selected)) next[r][c] = null;
      }
    }
    const displaced = current && !samePiece(current, selected) ? current : null;
    next[row][col] = selected;
    setSelected(displaced);
    setBoard(next);
    setStatus("playing");
  }

  async function checkSolution() {
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, { grid: board });
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: { grid: board } });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready") return <PuzzlePending phase={phase} />;
  if (clues.length === 0) return <PuzzlePending phase="error" />;

  const placed = new Set(board.flat().filter(Boolean).map((piece) => `${piece.shape}:${piece.color}`));
  const tray = SHAPES.flatMap((shape) => COLORS.map((color) => ({ shape, color })));

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="metaforms" value={difficulty} onChange={newGame} />
      <p className="play-rules text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div className="mb-4 flex w-full max-w-3xl flex-wrap justify-center gap-2">
        {clues.map((clue, index) => (
          <ClueCard key={`${clue.sign}-${clue.shape}-${clue.color}-${index}`} clue={clue} />
        ))}
      </div>

      <div className="mb-4 flex items-start justify-center gap-3">
        <PieceTray pieces={tray.slice(0, Math.ceil(tray.length / 2))} placed={placed} selected={selected} setSelected={setSelected} label={play.pieces} />
        <div className="inline-grid grid-cols-3 gap-1 rounded-lg bg-slate-300 p-1">
          {board.map((row, rowIndex) => row.map((piece, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => place(rowIndex, colIndex)}
                className={`flex h-14 w-14 items-center justify-center border border-slate-300 bg-white sm:h-16 sm:w-16 ${hintCell === key ? "ring-4 ring-[#2461f7] ring-inset" : ""}`}
              >
                {piece ? <Glyph shape={piece.shape} color={piece.color} size={36} /> : null}
              </button>
            );
          }))}
        </div>
        <PieceTray pieces={tray.slice(Math.ceil(tray.length / 2))} placed={placed} selected={selected} setSelected={setSelected} />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {play.check}
        </button>
        <ClearBoardButton onClick={clearBoard} />
        <button
          type="button"
          onClick={() => newGame()}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
        >
          {play.newPuzzle}
        </button>
        {status === "correct" && (
          <button
            type="button"
            onClick={handleSubmitScore}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            {play.save}
          </button>
        )}
      </div>

      {status === "correct" && <p className="play-correct text-emerald-600 mt-3">{play.correct}</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">{play.incorrect}</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
