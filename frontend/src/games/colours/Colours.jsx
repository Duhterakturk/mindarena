import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { useGameText } from "../common/gameText";
import { usePlayCopy } from "../common/playCopy";
import { useApplyCellHint } from "../common/cellHint";
import { PuzzlePending, useIssuedPuzzle } from "../common/useIssuedPuzzle";
import { COLOR_HEX, COLOR_IDS } from "./rounds";
import { useStartingDifficulty } from "../common/useStartingDifficulty";

export default function Colours() {
  const { t, i18n } = useTranslation();
  const copy = useGameText("colours");
  const play = usePlayCopy();
  const [difficulty, setDifficulty] = useStartingDifficulty();
  const { issue, phase, reload } = useIssuedPuzzle("colours", difficulty);
  const rounds = issue?.puzzle?.rounds || [];
  const attemptId = issue?.id;
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [reveal, setReveal] = useState(null);
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
    setReveal(null);
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  useApplyCellHint(attemptId, (hint) => {
    if (hint.kind === "choice") setReveal(hint);
  });

  function newGame(nextDifficulty) {
    if (nextDifficulty && nextDifficulty !== difficulty) setDifficulty(nextDifficulty);
    else reload();
  }

  function handleAnswer(colorName) {
    if (status !== "playing" || feedback) return;
    const round = rounds[roundIndex];
    const isRight = colorName === round.inkId;
    choicesRef.current = [...choicesRef.current, colorName];
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

  function inkWord(id) {
    const word = t(`colors.${id}`);
    return i18n.language.startsWith("tr") ? word.toLocaleUpperCase("tr") : word.toUpperCase();
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{copy.title}</h1>
      <DifficultyPicker gameSlug="colours" value={difficulty} onChange={newGame} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{copy.rules}</p>
      <p className="text-slate-500 text-sm mb-4">
        {play.clock(seconds)} — {play.round(Math.min(roundIndex + 1, rounds.length), rounds.length)}
      </p>

      {status === "playing" && round && (
        <>
          <div
            className="text-4xl font-extrabold mb-6 h-16 flex items-center"
            style={{ color: COLOR_HEX[round.inkId] }}
          >
            {inkWord(round.wordId)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COLOR_IDS.map((id) => (
              <button
                key={id}
                onClick={() => handleAnswer(id)}
                className={[
                  "px-4 py-3 rounded-lg font-semibold text-white",
                  reveal && roundIndex === reveal.round && id === reveal.value ? "ring-4 ring-ink ring-offset-2" : "",
                ].join(" ")}
                style={{ backgroundColor: COLOR_HEX[id] }}
              >
                {t(`colors.${id}`)}
              </button>
            ))}
          </div>
          {feedback && (
            <p className={feedback === "right" ? "text-emerald-600 mt-4" : "text-red-500 mt-4"}>
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
