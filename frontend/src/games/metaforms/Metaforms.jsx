import { useEffect, useRef, useState } from "react";
import { submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";

function oddIndexOf(shapes) {
  const freq = {};
  shapes.forEach((shape) => {
    freq[shape] = (freq[shape] || 0) + 1;
  });
  const odd = Object.keys(freq).find((shape) => freq[shape] === 1);
  return shapes.indexOf(odd);
}

function Shape({ type }) {
  const base = "w-14 h-14 bg-brand-500";
  if (type === "circle") return <div className={`${base} rounded-full`} />;
  if (type === "square") return <div className={base} />;
  if (type === "diamond") return <div className={`${base} rotate-45`} />;
  if (type === "triangle")
    return <div className="w-0 h-0 border-l-[28px] border-r-[28px] border-b-[48px] border-l-transparent border-r-transparent border-b-brand-500" />;
  return null;
}

const GRID_COLS = { 4: 2, 6: 3, 9: 3 };

export default function Metaforms() {
  const copy = useGameText("metaforms");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useState("easy");
  const { issue, phase, reload } = useIssuedPuzzle("metaforms", difficulty);
  const rounds = issue?.puzzle?.rounds || [];
  const attemptId = issue?.id;
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const choicesRef = useRef([]);

  useEffect(() => {
    if (!attemptId) return undefined;
    choicesRef.current = [];
    setRoundIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  function newGame(nextDifficulty) {
    if (nextDifficulty && nextDifficulty !== difficulty) setDifficulty(nextDifficulty);
    else reload();
  }

  function handleAnswer(index) {
    if (status !== "playing" || feedback) return;
    const round = rounds[roundIndex];
    const isRight = index === oddIndexOf(round.shapes);
    choicesRef.current = [...choicesRef.current, index];
    setFeedback(isRight ? "right" : "wrong");
    if (isRight) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      setFeedback(null);
      if (roundIndex + 1 >= rounds.length) {
        setStatus("finished");
        clearInterval(timerRef.current);
      } else {
        setRoundIndex((i) => i + 1);
      }
    }, 500);
  }

  async function handleSubmitScore() {
    if (!attemptId) return;
    try {
      await submitScore({ attempt_id: attemptId, answer: { choices: choicesRef.current } });
      setStatus("submitted");
    } catch {
      setStatus("rejected");
    }
  }

  if (phase !== "ready" || rounds.length === 0) return <PuzzlePending phase={phase} />;

  const round = rounds[roundIndex];
  const gridCols = round ? GRID_COLS[round.shapes.length] || 3 : 2;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="metaforms" value={difficulty} onChange={newGame} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">
        {play.clock(seconds)} — {play.round(Math.min(roundIndex + 1, rounds.length), rounds.length)}
      </p>

      {status === "playing" && round && (
        <>
          <div
            className="inline-grid gap-4 mb-4"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {round.shapes.map((shape, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-20 h-20 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-brand-50"
              >
                <Shape type={shape} />
              </button>
            ))}
          </div>
          {feedback && (
            <p className={feedback === "right" ? "text-emerald-600" : "text-red-500"}>
              {feedback === "right" ? play.right : play.wrong}
            </p>
          )}
        </>
      )}

      {status === "finished" && (
        <>
          <p className="text-lg font-semibold mb-3">{play.result(correctCount, rounds.length)}</p>
          <div className="flex gap-3">
            <button
              onClick={handleSubmitScore}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
            >
              {play.save}
            </button>
            <button
              onClick={() => newGame()}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
            >
              {play.newPuzzle}
            </button>
          </div>
        </>
      )}
      {status === "submitted" && <p className="text-emerald-600 mt-3">{play.saved}</p>}
      {status === "rejected" && <p className="text-red-500 mt-3">{play.rejected}</p>}
    </div>
  );
}
