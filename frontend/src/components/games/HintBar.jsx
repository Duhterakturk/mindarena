import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { openCellHint } from "../../api/games";
import { currentHintFocus, publishCellHint } from "../../games/common/cellHint";
import { hintFor } from "../../games/hints";

function describe(hint, tr) {
  if (!hint) return "";
  const row = (hint.row ?? 0) + 1;
  const col = (hint.col ?? 0) + 1;
  if (hint.kind === "fill") {
    return tr
      ? `Bu kareye ${hint.value} yaz: ${row}. satır, ${col}. sütun.`
      : `Write ${hint.value} in row ${row}, column ${col}.`;
  }
  if (hint.kind === "mark" && hint.note === "step") {
    return tr ? `${hint.label}’den sonraki adım bu kare.` : `The step after ${hint.label} is this cell.`;
  }
  if (hint.kind === "mark" && hint.note === "ship") {
    return tr ? "Bu karede gemi var." : "A ship sits in this cell.";
  }
  if (hint.kind === "mark" && hint.note === "star") {
    return tr ? "Bu kareye yıldız koy." : "Put a star in this cell.";
  }
  if (hint.kind === "mark" && hint.note === "shade") {
    return tr ? "Bu kare boyalı." : "This cell is shaded.";
  }
  if (hint.kind === "marks") {
    return tr
      ? `${hint.label} harfinin yolu bu karelerden geçer.`
      : `The ${hint.label} path runs through these cells.`;
  }
  if (hint.kind === "edge") {
    return tr ? "Bu kenar çitin bir parçası." : "This side is part of the fence.";
  }
  if (hint.kind === "piece") {
    return tr
      ? `${hint.name} parçası durması gereken yere kondu.`
      : `The ${hint.name} piece is placed where it belongs.`;
  }
  if (hint.kind === "spot") {
    return tr ? "1 burada." : "1 is here.";
  }
  if (hint.kind === "choice" && hint.value) {
    return tr ? "Doğru renk işaretlendi." : "The right color is marked.";
  }
  if (hint.kind === "choice") {
    return tr ? "Aykırı şekil işaretlendi." : "The odd shape is marked.";
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
      const data = await openCellHint(attempt.id, currentHintFocus());
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
        setNote(body?.error || (tr ? "İpucu verilemedi." : "The hint could not be given."));
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
          {open ? (tr ? "Gizle" : "Hide") : (tr ? "Nasıl düşünülür" : "How to think")}
        </button>
        <button
          type="button"
          onClick={revealCell}
          disabled={!attempt?.id || used || busy}
          className="press-btn text-sm disabled:opacity-50"
          style={{ padding: "0.55rem 1.1rem" }}
        >
          {used ? (tr ? "İpucu verildi" : "Hint used") : (tr ? "İpucu" : "Hint")}
        </button>
      </div>
      {open && (
        <div className="card-rise mt-3 bg-[#fffdf8] border border-line rounded-2xl p-4 text-sm text-ink">
          <p className="font-bold mb-1">{copy.hint}</p>
          <p className="text-stone-600">{copy.example}</p>
        </div>
      )}
      {note && <p className="mt-3 text-sm font-semibold">{note}</p>}
    </div>
  );
}
