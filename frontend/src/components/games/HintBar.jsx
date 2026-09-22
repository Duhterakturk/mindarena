import { useState } from "react";
import { useTranslation } from "react-i18next";
import { hintFor } from "../../games/hints";

export default function HintBar({ slug }) {
  const { i18n } = useTranslation();
  const copy = hintFor(slug, i18n.language.startsWith("en") ? "en" : "tr");
  const [open, setOpen] = useState(false);

  if (!copy) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="press-btn text-sm"
        style={{ padding: "0.55rem 1.1rem" }}
      >
        {open ? "İpucunu gizle" : "İpucu"}
      </button>
      {open && (
        <div className="card-rise mt-3 bg-[#fffdf8] border border-line rounded-2xl p-4 text-sm text-ink">
          <p className="font-bold mb-1">{copy.hint}</p>
          <p className="text-stone-600">{copy.example}</p>
        </div>
      )}
    </div>
  );
}
