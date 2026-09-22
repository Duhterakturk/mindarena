import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { openCellHint } from "../../api/games";
import { publishCellHint } from "../../games/common/cellHint";
import { hintFor } from "../../games/hints";

function describe(hint, tr) {
  if (!hint) return "";
  const row = (hint.row ?? 0) + 1;
  const col = (hint.col ?? 0) + 1;
  if (hint.kind === "fill") {
    return tr
      ? `Açılan kare: ${row}. satır, ${col}. sütun, sayı ${hint.value}.`
      : `Opened cell: row ${row}, column ${col}, number ${hint.value}.`;
  }
  if (hint.kind === "mark") {
    return tr
      ? `Bu kare işaretli: ${row}. satır, ${col}. sütun.`
      : `This cell is marked: row ${row}, column ${col}.`;
  }
  if (hint.kind === "edge") {
    return tr ? "Bu çizgi çizili." : "This line is drawn.";
  }
  if (hint.kind === "spot") {
    return tr ? "1 buradan başlar." : "Start at 1. It is highlighted.";
  }
  if (hint.kind === "choice") {
    return tr ? "Doğru seçenek işaretlendi." : "The right choice is marked.";
  }
  return "";
}

export default function HintBar({ slug }) {
  const { i18n } = useTranslation();
  const tr = !i18n.language.startsWith("en");
  const copy = hintFor(slug, tr ? "tr" : "en");
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [used, setUsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    function handle(event) {
      const detail = event.detail;
      setAttempt(detail);
      setUsed(Boolean(detail?.hint));
      setNote(detail?.hint ? describe(detail.hint, tr) : "");
    }
    window.addEventListener("mindarena:attempt", handle);
    return () => window.removeEventListener("mindarena:attempt", handle);
  }, [tr]);

  async function revealCell() {
    if (!attempt?.id || used || busy) return;
    setBusy(true);
    try {
      const data = await openCellHint(attempt.id);
      publishCellHint(data.hint);
      setUsed(true);
      setNote(describe(data.hint, tr));
    } catch (error) {
      const body = error.response?.data;
      if (error.response?.status === 409 && body?.hint) {
        publishCellHint(body.hint);
        setUsed(true);
        setNote(describe(body.hint, tr));
      } else {
        setNote(body?.error || (tr ? "Kare açılamadı." : "The cell could not be opened."));
      }
    } finally {
      setBusy(false);
    }
  }

  if (!copy) return null;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="press-btn text-sm"
          style={{ padding: "0.55rem 1.1rem" }}
        >
          {open ? (tr ? "İpucunu gizle" : "Hide hint") : (tr ? "İpucu" : "Hint")}
        </button>
        <button
          type="button"
          onClick={revealCell}
          disabled={!attempt?.id || used || busy}
          className="press-btn text-sm disabled:opacity-50"
          style={{ padding: "0.55rem 1.1rem" }}
        >
          {used ? (tr ? "Kare açıldı" : "Cell opened") : (tr ? "Bir kare aç" : "Open one cell")}
        </button>
      </div>
      {open && (
        <div className="card-rise mt-3 bg-[#fffdf8] border border-line rounded-2xl p-4 text-sm text-ink">
          <p className="font-bold mb-1">{copy.hint}</p>
          <p className="text-stone-600">{copy.example}</p>
        </div>
      )}
      {note && <p className="mt-3 text-sm font-semibold text-ink">{note}</p>}
    </div>
  );
}
