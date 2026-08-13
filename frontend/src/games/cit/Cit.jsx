import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { generate } from "./puzzles";

const DOT = 6;

function emptyGrid(rows, cols, value) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value));
}

export default function Cit() {
  const [difficulty, setDifficulty] = useState("easy");
  const [puzzle, setPuzzle] = useState(() => generate("easy"));
  const { clues, horizontalSolution, verticalSolution, size: n } = puzzle;
  const spacing = n >= 4 ? 48 : 56;

  const [hEdges, setHEdges] = useState(() => emptyGrid(n + 1, n, false));
  const [vEdges, setVEdges] = useState(() => emptyGrid(n, n + 1, false));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  // `puzzle` değiştiğinde (zorlukla ızgara boyutu `n` büyüyünce) kenar
  // dizilerini render SIRASINDA senkron sıfırla. `setHEdges`/`setVEdges`
  // yalnızca BİR SONRAKİ render'ı düzeltir; bu render'da `checkSolution`
  // gibi yerlerde eski (küçük) kenar dizilerinin yeni (büyük) çözümle
  // karışmaması için güvenli değerleri `displayHEdges`/`displayVEdges`
  // içinde tutuyoruz (bkz. GridFillGame.jsx'teki not).
  const [renderedPuzzle, setRenderedPuzzle] = useState(puzzle);
  let displayHEdges = hEdges;
  let displayVEdges = vEdges;
  if (puzzle !== renderedPuzzle) {
    displayHEdges = emptyGrid(n + 1, n, false);
    displayVEdges = emptyGrid(n, n + 1, false);
    setRenderedPuzzle(puzzle);
    setHEdges(displayHEdges);
    setVEdges(displayVEdges);
    setStatus("playing");
  }

  useEffect(() => {
    fetchGame("cit")
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [puzzle]);

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    setPuzzle(generate(newDifficulty));
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

  function checkSolution() {
    const hOk = displayHEdges.every((row, r) => row.every((v, c) => v === horizontalSolution[r][c]));
    const vOk = displayVEdges.every((row, r) => row.every((v, c) => v === verticalSolution[r][c]));
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
        difficulty,
        completed: true,
      });
      setStatus("submitted");
    } catch {
      // Giriş yapılmamışsa skor gönderilemez; sessizce yoksay.
    }
  }

  const pixelSize = spacing * n;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Çit</h1>
      <DifficultyPicker gameSlug="cit" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Hücrelerdeki sayı, o hücreyi çevreleyen kaç kenarın çizili olması gerektiğini
        gösterir. Tek bir kapalı döngü oluşacak şekilde kenarlara tıkla.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

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
              {clue}
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
          Kontrol Et
        </button>
        <button
          onClick={() => setPuzzle(generate(difficulty))}
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
