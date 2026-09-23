import { Fragment, useEffect, useRef, useState } from "react";
import { checkPuzzle, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useApplyCellHint } from "./cellHint";
import { useGameText } from "./gameText";
import { pathArms } from "./pathValidation";
import { usePlayCopy } from "./playCopy";

const REGION_BG = [
  "bg-amber-50",
  "bg-sky-50",
  "bg-emerald-50",
  "bg-rose-50",
  "bg-violet-50",
  "bg-orange-50",
  "bg-teal-50",
  "bg-lime-50",
  "bg-fuchsia-50",
];

function PathStroke({ row, col, marked, fixedCells }) {
  const arms = pathArms(row, col, marked, fixedCells);
  const alone = !arms.up && !arms.down && !arms.left && !arms.right;
  return (
    <span className="absolute inset-0">
      {alone && <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />}
      {arms.left && <span className="absolute left-0 top-1/2 h-1.5 w-1/2 -translate-y-1/2 bg-white" />}
      {arms.right && <span className="absolute right-0 top-1/2 h-1.5 w-1/2 -translate-y-1/2 bg-white" />}
      {arms.up && <span className="absolute left-1/2 top-0 h-1/2 w-1.5 -translate-x-1/2 bg-white" />}
      {arms.down && <span className="absolute bottom-0 left-1/2 h-1/2 w-1.5 -translate-x-1/2 bg-white" />}
    </span>
  );
}

function cellSizeClass(gridWidth) {
  if (gridWidth >= 8) return "w-8 h-8 text-sm";
  if (gridWidth >= 6) return "w-9 h-9";
  return "w-10 h-10";
}

/**
 * Hücre tıklayarak işaretleme mekaniğine sahip oyunlar için paylaşılan iskelet
 * (Amiral Battı, Yıldız Savaşları, Pentominolar, Patika, ABC Bağlama). Kullanıcı
 * hücrelere tıklayarak işaretler/kaldırır; çözüm, işaretli hücre kümesinin
 * `solutionSet` ile birebir eşleşmesiyle doğrulanır. `fixedCells` tıklanamayan,
 * önceden verilmiş etiketli hücrelerdir (kontrol dışında tutulur).
 */
export default function ToggleGridGame({
  slug,
  instructions,
  rows,
  cols,
  attemptId,
  fixedCells = {},
  rowClues,
  colClues,
  regionGrid,
  markSymbol = "●",
  flowMarks = false,
  extra,
  onRegenerate,
  difficulty,
  onDifficultyChange,
  validate,
  answerFrom,
}) {
  const copy = useGameText(slug);
  const play = usePlayCopy();
  const blurb = instructions || copy.rules;
  const [marked, setMarked] = useState(() => new Set());
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setMarked(new Set());
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  useApplyCellHint(attemptId, (hint) => {
    if (hint.kind !== "mark") return;
    const key = `${hint.row}-${hint.col}`;
    if (fixedCells[key] !== undefined) return;
    setMarked((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  });

  function toggleCell(r, c) {
    const key = `${r}-${c}`;
    if (fixedCells[key] !== undefined || status === "correct") return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setStatus("playing");
  }

  async function checkSolution() {
    if (validate) {
      const isCorrect = validate(marked, fixedCells);
      setStatus(isCorrect ? "correct" : "incorrect");
      if (isCorrect) clearInterval(timerRef.current);
      return;
    }
    if (!attemptId) return;
    try {
      const correct = await checkPuzzle(attemptId, answerFrom ? answerFrom(marked) : { cells: [...marked] });
      setStatus(correct ? "correct" : "incorrect");
      if (correct) clearInterval(timerRef.current);
    } catch {
      setStatus("rejected");
    }
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({
        attempt_id: attemptId,
        answer: answerFrom ? answerFrom(marked) : { cells: [...marked] },
      });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  const hasClues = rowClues || colClues;
  const gridCols = cols + (hasClues ? 1 : 0);
  const cellSize = cellSizeClass(gridCols);
  const clueCell = `${cellSize} flex items-center justify-center text-xs font-bold text-brand-700 text-center leading-tight`;

  // Bir ipucu tek sayı olabilir (Amiral Battı vb.) ya da nonogram tarzı
  // birden çok koşu uzunluğu dizisi olabilir (Kare Karalamaca).
  function renderClue(value) {
    if (Array.isArray(value)) return value.join(" ");
    return value;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      {onDifficultyChange && (
        <DifficultyPicker gameSlug={slug} value={difficulty} onChange={onDifficultyChange} />
      )}
      {blurb && <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{blurb}</p>}
      <p className="text-slate-500 text-sm mb-4">{play.clock(seconds)}</p>

      {extra}

      <div
        className="inline-grid max-w-full overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {hasClues && <div className={clueCell} />}
        {hasClues && colClues.map((v, i) => <div key={`cc-${i}`} className={clueCell}>{renderClue(v)}</div>)}

        {Array.from({ length: rows }).map((_, r) => (
          <Fragment key={r}>
            {hasClues && <div key={`rc-${r}`} className={clueCell}>{rowClues ? renderClue(rowClues[r]) : ""}</div>}
            {Array.from({ length: cols }).map((_, c) => {
              const key = `${r}-${c}`;
              const fixedLabel = fixedCells[key];
              const isMarked = marked.has(key);
              const regionClass = regionGrid ? REGION_BG[regionGrid[r][c] % REGION_BG.length] : "bg-white";
              if (fixedLabel !== undefined) {
                return (
                  <div
                    key={key}
                    className={`${cellSize} flex items-center justify-center border border-slate-300 bg-slate-800 text-white font-bold text-sm`}
                  >
                    {fixedLabel}
                  </div>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCell(r, c)}
                  className={[
                    cellSize,
                    "relative flex items-center justify-center border border-slate-300 text-lg",
                    isMarked ? "bg-brand-500 text-white" : `${regionClass} hover:bg-brand-50`,
                  ].join(" ")}
                >
                  {isMarked ? (flowMarks ? <PathStroke row={r} col={c} marked={marked} fixedCells={fixedCells} /> : markSymbol) : ""}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {play.check}
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
          >
            {play.newPuzzle}
          </button>
        )}
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
