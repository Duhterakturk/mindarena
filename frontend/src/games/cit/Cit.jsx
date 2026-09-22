import { useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { useApplyCellHint } from "../common/cellHint";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

const DOT = 6;

function emptyGrid(rows, cols, value) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value));
}

export default function Cit() {
  const copy = useGameText("cit");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("cit", difficulty);
  const puzzle = issue?.puzzle || null;
  const clues = puzzle?.clues;
  const n = puzzle?.size || 5;
  const attemptId = issue?.id;
  const spacing = n >= 7 ? 40 : 48;

  const [hEdges, setHEdges] = useState(null);
  const [vEdges, setVEdges] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const [renderedPuzzle, setRenderedPuzzle] = useState(null);
  let displayHEdges = hEdges;
  let displayVEdges = vEdges;
  if (puzzle && puzzle !== renderedPuzzle) {
    displayHEdges = emptyGrid(n + 1, n, false);
    displayVEdges = emptyGrid(n, n + 1, false);
    setRenderedPuzzle(puzzle);
    setHEdges(displayHEdges);
    setVEdges(displayVEdges);
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
    if (hint.kind !== "edge") return;
    const setter = hint.axis === "h" ? setHEdges : setVEdges;
    setter((prev) => {
      if (!prev?.[hint.row]) return prev;
      return prev.map((row, ri) => row.map((value, ci) => (ri === hint.row && ci === hint.col ? true : value)));
    });
  });

  function handleDifficultyChange(newDifficulty) {
    if (newDifficulty !== difficulty) setDifficulty(newDifficulty);
    else reload();
  }

  function toggleH(r, c) {
    if (status === "correct") return;
    setHEdges((prev) => prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? !v : v))));
    setStatus("playing");
  }

  function toggleV(r, c) {
    if (status === "correct") return;
    setVEdges((prev) => prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? !v : v))));
    setStatus("playing");
  }

  function answerEdges() {
    return { horizontal: displayHEdges, vertical: displayVEdges };
  }

  async function checkSolution() {
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, answerEdges());
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: answerEdges() });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready" || !displayHEdges || !clues) return <PuzzlePending phase={phase} />;

  const pixelSize = spacing * n;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="cit" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      <div
        className="relative bg-white max-w-full overflow-x-auto"
        style={{ width: pixelSize + 24, height: pixelSize + 24, margin: "0 auto" }}
      >
        {/* Hücre ipuçları */}
        {clues.map((row, r) =>
          row.map((clue, c) => (
            <div
              key={`clue-${r}-${c}`}
              className="absolute flex items-center justify-center text-sm font-bold text-slate-700"
              style={{ left: c * spacing + 12 + spacing / 2 - 8, top: r * spacing + 12 + spacing / 2 - 8, width: 16, height: 16 }}
            >
              {clue ?? ""}
            </div>
          ))
        )}

        {/* Yatay kenarlar */}
        {displayHEdges.map((row, r) =>
          row.map((active, c) => (
            <button
              key={`h-${r}-${c}`}
              type="button"
              onClick={() => toggleH(r, c)}
              className={`absolute rounded ${active ? "bg-brand-600" : "bg-slate-200 hover:bg-slate-300"}`}
              style={{ left: c * spacing + 12 + DOT, top: r * spacing + 12 - 2, width: spacing - DOT * 2, height: 4 }}
            />
          ))
        )}

        {/* Dikey kenarlar */}
        {displayVEdges.map((row, r) =>
          row.map((active, c) => (
            <button
              key={`v-${r}-${c}`}
              type="button"
              onClick={() => toggleV(r, c)}
              className={`absolute rounded ${active ? "bg-brand-600" : "bg-slate-200 hover:bg-slate-300"}`}
              style={{ left: c * spacing + 12 - 2, top: r * spacing + 12 + DOT, width: 4, height: spacing - DOT * 2 }}
            />
          ))
        )}

        {/* Noktalar */}
        {Array.from({ length: n + 1 }).map((_, r) =>
          Array.from({ length: n + 1 }).map((_, c) => (
            <div
              key={`dot-${r}-${c}`}
              className="absolute rounded-full bg-slate-800"
              style={{ left: c * spacing + 12 - DOT / 2, top: r * spacing + 12 - DOT / 2, width: DOT, height: DOT }}
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
      {status === "incorrect" && <p className="text-red-500 mt-3">{play.incorrect}</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
