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

function applyStep(prev, letter, key, fixed) {
  const path = [...(prev[letter] || [])];
  if (path.length === 0) return prev;
  const tip = path[path.length - 1];
  if (key === tip) return prev;
  if (path.length >= 2 && key === path[path.length - 2]) {
    path.pop();
    return { ...prev, [letter]: path };
  }
  if (!neighbors(tip, key) || path.includes(key)) return prev;
  const letterHere = fixed[key];
  if (letterHere && letterHere !== letter) return prev;
  if (letterHere === letter && path.includes(key)) return prev;
  const next = { ...prev };
  const other = ownerOf(prev, key);
  if (other && other.letter !== letter) {
    if (other.index === 0) return prev;
    next[other.letter] = prev[other.letter].slice(0, other.index);
  }
  next[letter] = [...path, key];
  return next;
}

function parseCell(key) {
  const [row, col] = key.split("-").map(Number);
  return { row, col };
}

function traverse(fromKey, toKey) {
  const from = parseCell(fromKey);
  const to = parseCell(toKey);
  const steps = [];
  let { row, col } = from;
  const horizontal = Math.sign(to.col - col);
  while (col !== to.col) {
    col += horizontal;
    steps.push(`${row}-${col}`);
  }
  const vertical = Math.sign(to.row - row);
  while (row !== to.row) {
    row += vertical;
    steps.push(`${row}-${col}`);
  }
  return steps;
}

function cellSize(boardSize) {
  if (!boardSize || typeof window === "undefined") return 44;
  return Math.floor(Math.min(56, (window.innerWidth - 32) / boardSize));
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
  const [selected, setSelected] = useState(null);
  const [shake, setShake] = useState(null);
  const [status, setStatus] = useState("playing");
  const [note, setNote] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [cell, setCell] = useState(44);
  const [ink, setInk] = useState(null);
  const timerRef = useRef(null);
  const drag = useRef(null);
  const pointer = useRef(null);
  const pathsRef = useRef(paths);
  const boardRef = useRef(null);
  pathsRef.current = paths;

  const fixed = puzzle?.fixedCells || {};
  const size = puzzle?.rows || 0;
  const letters = [...new Set(Object.values(fixed))].sort();

  useEffect(() => {
    if (!size) return undefined;
    const measure = () => setCell(cellSize(size));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [size]);

  useEffect(() => {
    if (!attemptId) return undefined;
    setPaths({});
    setSelected(null);
    setInk(null);
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

  function reachedMate(letter, path) {
    if (!path || path.length < 2) return false;
    const ends = endsOf(letter);
    return ends.includes(path[0]) && ends.includes(path[path.length - 1]) && path[0] !== path[path.length - 1];
  }

  function writePaths(next) {
    pathsRef.current = next;
    setPaths(next);
  }

  function clickCell(key) {
    const letterHere = fixed[key];
    const current = pathsRef.current;
    const path = selected ? current[selected] || [] : [];
    const tip = path[path.length - 1];

    if (selected && key === tip && path.length > 0) {
      if (path.length <= 1) {
        writePaths({ ...current, [selected]: [] });
        setSelected(null);
      } else {
        writePaths({ ...current, [selected]: current[selected].slice(0, -1) });
      }
      return;
    }

    if (selected && tip && neighbors(tip, key)) {
      const stepped = applyStep(current, selected, key, fixed);
      if (stepped !== current) {
        writePaths(stepped);
        if (reachedMate(selected, stepped[selected])) setSelected(null);
        return;
      }
    }

    if (letterHere) {
      setSelected(letterHere);
      const existing = current[letterHere] || [];
      if (existing.length === 0) writePaths({ ...current, [letterHere]: [key] });
      else if (existing[0] === key && existing[existing.length - 1] !== key) {
        writePaths({ ...current, [letterHere]: [...existing].reverse() });
      }
      return;
    }

    const occupied = ownerOf(current, key);
    if (occupied && occupied.index === (current[occupied.letter] || []).length - 1 && occupied.index > 0) {
      setSelected(occupied.letter);
      return;
    }

    setShake(key);
    window.setTimeout(() => setShake((value) => (value === key ? null : value)), 180);
    setSelected(null);
  }

  function cellUnder(event) {
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    return hit?.closest?.("[data-cell]")?.getAttribute("data-cell") || null;
  }

  function onPointerDown(event, key) {
    if (status === "correct") return;
    event.preventDefault();
    boardRef.current?.setPointerCapture?.(event.pointerId);
    const letterHere = fixed[key];
    const occupied = ownerOf(pathsRef.current, key);
    const occupiedPath = occupied ? pathsRef.current[occupied.letter] || [] : [];
    const isTip = Boolean(occupied && occupied.index === occupiedPath.length - 1 && occupied.index > 0);
    if (!letterHere && !isTip) {
      pointer.current = { key, x: event.clientX, y: event.clientY, dragged: false, drawing: false };
      drag.current = null;
      return;
    }
    const letter = letterHere || occupied.letter;
    const existing = pathsRef.current[letter] || [];
    const tip = existing[existing.length - 1];
    const completing = letterHere && selected === letter && tip && key !== tip && neighbors(tip, key);
    if (completing) {
      const stepped = applyStep(pathsRef.current, letter, key, fixed);
      if (stepped !== pathsRef.current) writePaths(stepped);
      const finished = reachedMate(letter, (stepped[letter] || existing));
      if (finished) setSelected(null);
      pointer.current = { key, x: event.clientX, y: event.clientY, dragged: false, drawing: false, done: finished };
      drag.current = null;
      return;
    }
    const alreadyTip = tip === key && existing.length > 0;
    if (letterHere) {
      if (reachedMate(letter, existing) || existing.length === 0 || !existing.includes(key)) {
        writePaths({ ...pathsRef.current, [letter]: [key] });
      } else if (existing[0] === key && tip !== key) {
        writePaths({ ...pathsRef.current, [letter]: [...existing].reverse() });
      }
    }
    drag.current = { letter };
    pointer.current = { key, x: event.clientX, y: event.clientY, dragged: false, drawing: true, alreadyTip, letter, done: false };
    setSelected(letter);
    setInk(letter);
  }

  function onPointerMove(event) {
    const active = pointer.current;
    if (!active || active.done) return;
    if (!active.drawing) {
      if (Math.hypot(event.clientX - active.x, event.clientY - active.y) >= 8) active.dragged = true;
      return;
    }
    active.dragged = true;
    const key = cellUnder(event);
    if (!key) return;
    const letter = active.letter;
    let base = pathsRef.current;
    const path = base[letter] || [];
    const at = path.indexOf(key);
    if (at >= 0) {
      if (at < path.length - 1) writePaths({ ...base, [letter]: path.slice(0, at + 1) });
      return;
    }
    const tip = (pathsRef.current[letter] || []).at(-1);
    if (!tip) return;
    for (const step of traverse(tip, key)) {
      const next = applyStep(base, letter, step, fixed);
      if (next === base) break;
      base = next;
      if (reachedMate(letter, base[letter])) {
        active.done = true;
        setSelected(null);
        break;
      }
    }
    if (base !== pathsRef.current) writePaths(base);
  }

  function onPointerUp() {
    const active = pointer.current;
    pointer.current = null;
    drag.current = null;
    setInk(null);
    if (active && !active.dragged && !active.drawing) clickCell(active.key);
    else if (active && !active.dragged && active.alreadyTip) clickCell(active.key);
  }

  function localProblem() {
    if (filledCount() < size * size) return t("play.emptyCell");
    const open = letters.find((letter) => !reachedMate(letter, paths[letter]));
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

  const width = size * cell;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="abc-baglama" value={difficulty} onChange={setDifficulty} />
      <p className="play-rules text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{t("play.flowHint")}</p>
      <p className="text-slate-500 text-sm mb-2">{play.clock(seconds)}</p>
      {letters.map((letter) => (
        <span key={letter} hidden data-testid={`path-${letter}`} data-length={(paths[letter] || []).length} />
      ))}
      <p className="text-sm font-semibold text-slate-700 mb-3" data-testid="link-progress">
        {t("play.linked", { linked: linkedCount(), pairs: letters.length, filled: filledCount(), total: size * size })}
      </p>

      <div
        ref={boardRef}
        className="relative select-none bg-white"
        style={{ width, height: width, touchAction: "none" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <style>{`@keyframes abc-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }`}</style>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${size}, ${cell}px)`, gridTemplateRows: `repeat(${size}, ${cell}px)` }}>
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
                className="border border-slate-300 bg-transparent touch-none"
                style={{ width: cell, height: cell, animation: shake === key ? "abc-shake 180ms linear" : undefined }}
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
              return `${col * cell + cell / 2},${row * cell + cell / 2}`;
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
          {ink && (paths[ink] || []).length > 0 && (() => {
            const tip = paths[ink][paths[ink].length - 1];
            const [row, col] = tip.split("-").map(Number);
            return (
              <circle
                data-testid="ink-tip"
                cx={col * cell + cell / 2}
                cy={row * cell + cell / 2}
                r={cell * 0.9}
                fill={COLOR[ink]}
                opacity="0.35"
              />
            );
          })()}
        </svg>
        <div
          className="pointer-events-none absolute inset-0 z-20 grid"
          style={{ gridTemplateColumns: `repeat(${size}, ${cell}px)`, gridTemplateRows: `repeat(${size}, ${cell}px)` }}
        >
          {Array.from({ length: size * size }, (_, index) => {
            const key = `${Math.floor(index / size)}-${index % size}`;
            const letter = fixed[key];
            const active = letter && selected === letter;
            const mark = Math.round(cell * 0.7);
            return (
              <div key={index} className="flex items-center justify-center" style={{ width: cell, height: cell }}>
                {letter && (
                  <span
                    data-mark={key}
                    className="flex items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      width: mark,
                      height: mark,
                      background: COLOR[letter],
                      transform: active ? "scale(1.15)" : undefined,
                      boxShadow: active ? `0 0 0 3px #fff, 0 0 0 5px ${COLOR[letter]}` : undefined,
                    }}
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
        <ClearBoardButton onClick={() => { setPaths({}); setSelected(null); setStatus("playing"); setNote(""); }} />
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
