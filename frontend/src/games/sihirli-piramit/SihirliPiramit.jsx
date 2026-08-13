import { useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";
import DifficultyPicker from "../../components/games/DifficultyPicker";
import { generate } from "./puzzles";

function cloneRows(rows) {
  return rows.map((row) => [...row]);
}

export default function SihirliPiramit() {
  const [difficulty, setDifficulty] = useState("easy");
  const [{ puzzle, solution }, setGame] = useState(() => generate("easy"));
  const givenMask = puzzle.map((row) => row.map((v) => v !== 0));

  const [board, setBoard] = useState(() => cloneRows(puzzle));
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  // `puzzle` değiştiğinde (zorlukla piramit boyutu büyüyünce) `board`'u
  // render SIRASINDA senkron sıfırla. `setBoard` yalnızca BİR SONRAKİ
  // render'ı düzeltir — BU render'ın JSX'i hâlâ eski (küçük) `board` ile
  // yeni (büyük) `givenMask`'ı kullanmaya çalışıp çökerdi. Bu yüzden bu
  // render'da kullanılacak güvenli değeri `displayBoard` içinde tutuyoruz.
  const [renderedPuzzle, setRenderedPuzzle] = useState(puzzle);
  let displayBoard = board;
  if (puzzle !== renderedPuzzle) {
    displayBoard = cloneRows(puzzle);
    setRenderedPuzzle(puzzle);
    setBoard(displayBoard);
    setStatus("playing");
  }

  useEffect(() => {
    fetchGame("sihirli-piramit")
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
    setGame(generate(newDifficulty));
  }

  function handleCellChange(row, col, value) {
    if (givenMask[row][col] || status === "correct") return;
    const digits = value.replace(/[^0-9]/g, "").slice(0, 3);
    const next = cloneRows(displayBoard);
    next[row][col] = digits ? Number(digits) : 0;
    setBoard(next);
    setStatus("playing");
  }

  function checkSolution() {
    const isCorrect = displayBoard.every((row, r) => row.every((val, c) => val === solution[r][c]));
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

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">Sihirli Piramit</h1>
      <DifficultyPicker gameSlug="sihirli-piramit" value={difficulty} onChange={handleDifficultyChange} />
      <p className="text-slate-500 text-sm mb-2 max-w-md text-center">
        Her hücre, kendi altındaki iki komşu hücrenin toplamı olmalıdır. Taban
        verilmiştir; üst kısmı tamamla.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      <div className="flex flex-col items-center gap-1 max-w-full overflow-x-auto">
        {displayBoard.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((val, c) => (
              <input
                key={c}
                value={val || ""}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                readOnly={givenMask[r][c] || status === "correct"}
                className={[
                  "w-12 h-12 text-center text-base border border-slate-300 focus:outline-none focus:bg-brand-100",
                  givenMask[r][c] ? "bg-slate-100 font-bold text-slate-700" : "bg-white",
                ].join(" ")}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={checkSolution}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          Kontrol Et
        </button>
        <button
          onClick={() => setGame(generate(difficulty))}
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
      {status === "incorrect" && <p className="text-red-500 mt-3">Bazı hücreler yanlış, tekrar dene.</p>}
      {status === "submitted" && <p className="text-emerald-600 mt-3">Skor kaydedildi.</p>}
    </div>
  );
}
