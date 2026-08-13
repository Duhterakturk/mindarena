import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { generateRounds } from "./rounds";

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
  const [difficulty, setDifficulty] = useState("easy");
  const [rounds, setRounds] = useState(() => generateRounds("easy"));
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("metaforms")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  function newGame(nextDifficulty) {
    const d = nextDifficulty || difficulty;
    setDifficulty(d);
    setRounds(generateRounds(d));
    setRoundIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setStatus("playing");
    setSeconds(0);
  }

  function handleAnswer(index) {
    if (status !== "playing" || feedback) return;
    const round = rounds[roundIndex];
    const isRight = index === round.oddIndex;
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
    if (!gameId) return;
    try {
      await submitScore({
        game_id: gameId,
        points: Math.round((correctCount / rounds.length) * 1000),
        duration_seconds: seconds,
        difficulty,
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  const round = rounds[roundIndex];
  const gridCols = round ? GRID_COLS[round.shapes.length] || 3 : 2;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Metaforms</h1>
      <DifficultyPicker gameSlug="metaforms" value={difficulty} onChange={newGame} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Şekillerden diğerlerinden farklı olanı bul.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} — Tur {Math.min(roundIndex + 1, rounds.length)}/{rounds.length}
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
              {feedback === "right" ? "Doğru!" : "Yanlış."}
            </p>
          )}
        </>
      )}

      {status === "finished" && (
        <>
          <p className="text-lg font-semibold mb-3">
            Sonuç: {correctCount} / {rounds.length} doğru
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSubmitScore}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
            >
              Skoru Kaydet
            </button>
            <button
              onClick={() => newGame()}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
            >
              Yeni Bulmaca
            </button>
          </div>
        </>
      )}
      {status === "submitted" && <p className="text-emerald-600 mt-3">Skor kaydedildi.</p>}
    </div>
  );
}
