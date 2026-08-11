import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { COLORS, generateRounds } from "./rounds";

export default function Colours() {
  const [rounds, setRounds] = useState(() => generateRounds());
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null); // "right" | "wrong" | null
  const [status, setStatus] = useState("playing"); // playing | finished | submitted
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("colours")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  function newGame() {
    setRounds(generateRounds());
    setRoundIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setStatus("playing");
    setSeconds(0);
  }

  function handleAnswer(colorName) {
    if (status !== "playing" || feedback) return;
    const round = rounds[roundIndex];
    const isRight = colorName === round.ink;
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
        difficulty: "easy",
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  const round = rounds[roundIndex];

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Colours</h1>
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Kelimenin anlamına değil, yazıldığı RENGE göre doğru düğmeye bas.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} — Tur {Math.min(roundIndex + 1, rounds.length)}/{rounds.length}
      </p>

      {status === "playing" && round && (
        <>
          <div
            className="text-4xl font-extrabold mb-6 h-16 flex items-center"
            style={{ color: COLORS[round.ink] }}
          >
            {round.word}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(COLORS).map((name) => (
              <button
                key={name}
                onClick={() => handleAnswer(name)}
                className="px-4 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: COLORS[name] }}
              >
                {name}
              </button>
            ))}
          </div>
          {feedback && (
            <p className={feedback === "right" ? "text-emerald-600 mt-4" : "text-red-500 mt-4"}>
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
              onClick={newGame}
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
