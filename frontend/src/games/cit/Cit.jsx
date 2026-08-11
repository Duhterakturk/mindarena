import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import { generate } from "./puzzles";

const SPACING = 56;
const DOT = 6;

function emptyGrid(rows, cols, value) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value));
}

export default function Cit() {
  const [puzzle, setPuzzle] = useState(generate);
  const { clues, horizontalSolution, verticalSolution } = puzzle;

  const [hEdges, setHEdges] = useState(() => emptyGrid(3, 2, false));
  const [vEdges, setVEdges] = useState(() => emptyGrid(2, 3, false));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame("cit")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setHEdges(emptyGrid(3, 2, false));
    setVEdges(emptyGrid(2, 3, false));
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [puzzle]);

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

  function checkSolution() {
    const hOk = hEdges.every((row, r) => row.every((v, c) => v === horizontalSolution[r][c]));
    const vOk = vEdges.every((row, r) => row.every((v, c) => v === verticalSolution[r][c]));
    const isCorrect = hOk && vOk;
    setStatus(isCorrect ? "correct" : "incorrect");
    if (isCorrect) clearInterval(timerRef.current);
  }

  async function handleSubmitScore() {
    if (!gameId) return;
    try {
      await submitScore({
        game_id: gameId,
        points: Math.max(1000 - seconds, 100),
        duration_seconds: seconds,
        difficulty: "easy",
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  const size = SPACING * 2;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Çit</h1>
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Hücrelerdeki sayı, o hücreyi çevreleyen kaç kenarın çizili olması gerektiğini
        gösterir. Tek bir kapalı döngü oluşacak şekilde kenarlara tıkla.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div className="relative bg-white" style={{ width: size + 24, height: size + 24, margin: "0 auto" }}>
        {/* Hücre ipuçları */}
        {clues.map((row, r) =>
          row.map((clue, c) => (
            <div
              key={`clue-${r}-${c}`}
              className="absolute flex items-center justify-center text-sm font-bold text-slate-700"
              style={{ left: c * SPACING + 12 + SPACING / 2 - 8, top: r * SPACING + 12 + SPACING / 2 - 8, width: 16, height: 16 }}
            >
              {clue}
            </div>
          ))
        )}

        {/* Yatay kenarlar */}
        {hEdges.map((row, r) =>
          row.map((active, c) => (
            <button
              key={`h-${r}-${c}`}
              type="button"
              onClick={() => toggleH(r, c)}
              className={`absolute rounded ${active ? "bg-brand-600" : "bg-slate-200 hover:bg-slate-300"}`}
              style={{ left: c * SPACING + 12 + DOT, top: r * SPACING + 12 - 2, width: SPACING - DOT * 2, height: 4 }}
            />
          ))
        )}

        {/* Dikey kenarlar */}
        {vEdges.map((row, r) =>
          row.map((active, c) => (
            <button
              key={`v-${r}-${c}`}
              type="button"
              onClick={() => toggleV(r, c)}
              className={`absolute rounded ${active ? "bg-brand-600" : "bg-slate-200 hover:bg-slate-300"}`}
              style={{ left: c * SPACING + 12 - 2, top: r * SPACING + 12 + DOT, width: 4, height: SPACING - DOT * 2 }}
            />
          ))
        )}

        {/* Noktalar */}
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <div
              key={`dot-${r}-${c}`}
              className="absolute rounded-full bg-slate-800"
              style={{ left: c * SPACING + 12 - DOT / 2, top: r * SPACING + 12 - DOT / 2, width: DOT, height: DOT }}
            />
          ))
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          Kontrol Et
        </button>
        <button
          onClick={() => setPuzzle(generate())}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
        >
          Yeni Bulmaca
        </button>
        {status === "correct" && (
          <button
            onClick={handleSubmitScore}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600"
          >
            Skoru Kaydet
          </button>
        )}
      </div>

      {status === "correct" && <p className="text-emerald-600 mt-3">Tebrikler, doğru çözdün!</p>}
      {status === "incorrect" && <p className="text-red-500 mt-3">Henüz doğru değil, tekrar dene.</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">Skor kaydedildi.</p>}
    </div>
  );
}
