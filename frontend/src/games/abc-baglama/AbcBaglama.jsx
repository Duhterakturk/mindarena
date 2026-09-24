import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import ClearBoardButton from "../common/ClearBoardButton";
import { useApplyCellHint } from "../common/cellHint";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

const COLOR = {
  A: "#e11d48",
  B: "#2563eb",
  C: "#16a34a",
  D: "#ea580c",
  E: "#7c3aed",
  F: "#0d9488",
  G: "#db2777",
};

const CELL = 44;

function neighbors(a, b) {
  const [ar, ac] = a.split("-").map(Number);
  const [br, bc] = b.split("-").map(Number);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

function ownerOf(paths, key) {
  for (const [letter, path] of Object.entries(paths)) {
    const index = path.indexOf(key);
    if (index >= 0) return { letter, index };
  }
  return null;
}

export default function AbcBaglama() {
  const { t } = useTranslation();
  const copy = useGameText("abc-baglama");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("abc-baglama", difficulty);
  const puzzle = issue?.puzzle;
  const attemptId = issue?.id;
  const [paths, setPaths] = useState({});
  const [status, setStatus] = useState("playing");
  const [note, setNote] = useState("");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const drag = useRef(null);
  const boardRef = useRef(null);

  const fixed = puzzle?.fixedCells || {};
  const size = puzzle?.rows || 0;
  const letters = [...new Set(Object.values(fixed))].sort();

  useEffect(() => {
    if (!attemptId) return undefined;
    setPaths({});
    setStatus("playing");
    setNote("");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  useApplyCellHint(attemptId, (hint) => {
    if (hint.kind !== "marks" || !hint.label || !Array.isArray(hint.cells)) return;
    setPaths((prev) => ({ ...prev, [hint.label]: hint.cells.map(String) }));
    setStatus("playing");
    setNote("");
  });

  function endsOf(letter) {
    return Object.entries(fixed).filter(([, value]) => value === letter).map(([key]) => key);
  }

  function linkedCount() {
    return letters.filter((letter) => {
      const path = paths[letter] || [];
      const ends = endsOf(letter);
      return path.length >= 2 && ends.includes(path[0]) && ends.includes(path[path.length - 1]) && path[0] !== path[path.length - 1];
    }).length;
  }

  function filledCount() {
    return new Set(Object.values(paths).flat()).size;
  }

  function begin(letter, from) {
    drag.current = { letter, from };
    setStatus("playing");
    setNote("");
  }

  function onPointerMove(event) {
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const key = hit?.closest?.("[data-cell]")?.getAttribute("data-cell");
    if (key) extend(key);
  }

  function onPointerDown(event, key) {
    if (status === "correct") return;
    boardRef.current?.setPointerCapture?.(event.pointerId);
    const letterHere = fixed[key];
    const occupied = ownerOf(paths, key);
    if (letterHere) {
      const path = paths[letterHere] || [];
      if (path.length > 1) {
        setPaths((prev) => ({ ...prev, [letterHere]: [] }));
        drag.current = null;
        return;
      }
      setPaths((prev) => ({ ...prev, [letterHere]: [key] }));
      begin(letterHere, key);
      return;
    }
    if (occupied && occupied.index === (paths[occupied.letter] || []).length - 1 && occupied.index > 0) {
      begin(occupied.letter, key);
    }
  }

  function extend(key) {
    const active = drag.current;
    if (!active) return;
    setPaths((prev) => {
      const path = [...(prev[active.letter] || [])];
      if (path.length === 0) return prev;
      const tip = path[path.length - 1];
      if (key === tip) return prev;
      if (path.length >= 2 && key === path[path.length - 2]) {
        path.pop();
        return { ...prev, [active.letter]: path };
      }
      if (!neighbors(tip, key) || path.includes(key)) return prev;
      const letterHere = fixed[key];
      if (letterHere && letterHere !== active.letter) return prev;
      if (letterHere === active.letter && path.includes(letterHere)) return prev;
      const next = { ...prev };
      const other = ownerOf(prev, key);
      if (other && other.letter !== active.letter) {
        if (other.index === 0) return prev;
        next[other.letter] = prev[other.letter].slice(0, other.index);
      }
      next[active.letter] = [...path, key];
      if (letterHere === active.letter) drag.current = null;
      return next;
    });
  }

  function onPointerUp() {
    drag.current = null;
  }

  function localProblem() {
    if (filledCount() < size * size) return t("play.emptyCell");
    const open = letters.find((letter) => {
      const path = paths[letter] || [];
      const ends = endsOf(letter);
      return path.length < 2 || !ends.includes(path[0]) || !ends.includes(path[path.length - 1]) || path[0] === path[path.length - 1];
    });
    return open ? t("play.letterOpen", { letter: open }) : "";
  }

  async function checkSolution() {
    if (!attemptId) return;
    const problem = localProblem();
    if (problem) {
      setNote(problem);
      setStatus("incorrect");
      return;
    }
    try {
      const correct = await checkPuzzle(attemptId, { paths });
      setStatus(correct ? "correct" : "incorrect");
      setNote(correct ? "" : play.incorrect);
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
      setNote(play.rejected);
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: { paths } });
      setStatus("submitted");
      setNote(play.saved);
    } catch {
      setStatus("rejected");
      setNote(play.rejected);
    }
  }

  if (phase !== "ready" || !size) return <PuzzlePending phase={phase} />;

  const width = size * CELL;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="abc-baglama" value={difficulty} onChange={setDifficulty} />
      <p className="play-rules text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-2">{play.clock(seconds)}</p>
      <p className="text-sm font-semibold text-slate-700 mb-3">
        {t("play.linked", { linked: linkedCount(), pairs: letters.length, filled: filledCount(), total: size * size })}
      </p>

      <div
        ref={boardRef}
        className="relative touch-none select-none bg-white"
        style={{ width, height: width }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
          {Array.from({ length: size * size }, (_, index) => {
            const row = Math.floor(index / size);
            const col = index % size;
            const key = `${row}-${col}`;
            return (
              <button
                key={key}
                type="button"
                data-cell={key}
                aria-label={fixed[key] || key}
                onPointerDown={(event) => onPointerDown(event, key)}
                className="border border-slate-300 bg-transparent"
                style={{ width: CELL, height: CELL }}
              />
            );
          })}
        </div>
        <svg className="absolute inset-0 z-10 pointer-events-none" width={width} height={width}>
          {letters.map((letter) => {
            const path = paths[letter] || [];
            if (path.length < 2) return null;
            const points = path.map((key) => {
              const [row, col] = key.split("-").map(Number);
              return `${col * CELL + CELL / 2},${row * CELL + CELL / 2}`;
            }).join(" ");
            return (
              <polyline
                key={letter}
                points={points}
                fill="none"
                stroke={COLOR[letter]}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 z-20 grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
          {Array.from({ length: size * size }, (_, index) => {
            const letter = fixed[`${Math.floor(index / size)}-${index % size}`];
            return (
              <div key={index} className="flex items-center justify-center">
                {letter && (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: COLOR[letter] }}
                  >
                    {letter}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button type="button" onClick={checkSolution} className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold">{play.check}</button>
        <ClearBoardButton onClick={() => { setPaths({}); setStatus("playing"); setNote(""); }} />
        <button type="button" onClick={reload} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold">{play.newPuzzle}</button>
        {status === "correct" && (
          <button type="button" onClick={handleSubmitScore} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold">{play.save}</button>
        )}
      </div>
      {note && <p className={`mt-3 ${status === "correct" || status === "submitted" ? "text-emerald-600" : "text-red-500"}`}>{note}</p>}
      {status === "correct" && !note && <p className="text-emerald-600 mt-3">{play.correct}</p>}
    </div>
  );
}
