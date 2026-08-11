import { Fragment, useEffect, useRef, useState } from "react";
import { fetchGame, submitScore } from "../../api/games";

/**
 * Hücre tıklayarak işaretleme mekaniğine sahip oyunlar için paylaşılan iskelet
 * (Amiral Battı, Yıldız Savaşları, Pentominolar, Patika, ABC Bağlama). Kullanıcı
 * hücrelere tıklayarak işaretler/kaldırır; çözüm, işaretli hücre kümesinin
 * `solutionSet` ile birebir eşleşmesiyle doğrulanır. `fixedCells` tıklanamayan,
 * önceden verilmiş etiketli hücrelerdir (kontrol dışında tutulur).
 */
export default function ToggleGridGame({
  slug,
  title,
  instructions,
  rows,
  cols,
  solutionSet,
  fixedCells = {},
  rowClues,
  colClues,
  markSymbol = "●",
  extra,
  onRegenerate,
}) {
  const [marked, setMarked] = useState(() => new Set());
  const [status, setStatus] = useState("playing");
  const [seconds, setSeconds] = useState(0);
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchGame(slug)
      .then((g) => setGameId(g.id))
      .catch(() => {});
  }, [slug]);

  // `solutionSet` referansı değiştiğinde (ör. "Yeni Bulmaca") tahtayı sıfırla.
  useEffect(() => {
    setMarked(new Set());
    setStatus("playing");
    setSeconds(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [solutionSet]);

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

  function checkSolution() {
    const target = new Set(solutionSet);
    const cellsToCheck = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}-${c}`;
        if (fixedCells[key] === undefined) cellsToCheck.push(key);
      }
    }
    const isCorrect = cellsToCheck.every((key) => marked.has(key) === target.has(key));
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

  const hasClues = rowClues || colClues;
  const gridCols = cols + (hasClues ? 1 : 0);
  const clueCell = "w-10 h-10 flex items-center justify-center text-xs font-bold text-brand-700 text-center leading-tight";

  // Bir ipucu tek sayı olabilir (Amiral Battı vb.) ya da nonogram tarzı
  // birden çok koşu uzunluğu dizisi olabilir (Kare Karalamaca).
  function renderClue(value) {
    if (Array.isArray(value)) return value.join(" ");
    return value;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      {instructions && <p className="text-slate-500 text-sm mb-2 max-w-md text-center">{instructions}</p>}
      <p className="text-slate-500 text-sm mb-4">
        Süre: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </p>

      {extra}

      <div className="inline-grid" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
        {hasClues && <div className={clueCell} />}
        {hasClues && colClues.map((v, i) => <div key={`cc-${i}`} className={clueCell}>{renderClue(v)}</div>)}

        {Array.from({ length: rows }).map((_, r) => (
          <Fragment key={r}>
            {hasClues && <div key={`rc-${r}`} className={clueCell}>{rowClues ? renderClue(rowClues[r]) : ""}</div>}
            {Array.from({ length: cols }).map((_, c) => {
              const key = `${r}-${c}`;
              const fixedLabel = fixedCells[key];
              const isMarked = marked.has(key);
              if (fixedLabel !== undefined) {
                return (
                  <div
                    key={key}
                    className="w-10 h-10 flex items-center justify-center border border-slate-300 bg-slate-800 text-white font-bold text-sm"
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
                    "w-10 h-10 flex items-center justify-center border border-slate-300 text-lg",
                    isMarked ? "bg-brand-500 text-white" : "bg-white hover:bg-brand-50",
                  ].join(" ")}
                >
                  {isMarked ? markSymbol : ""}
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
          Kontrol Et
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
          >
            Yeni Bulmaca
          </button>
        )}
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
