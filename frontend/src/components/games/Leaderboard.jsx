import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchLeaderboard } from "../../api/games";

const SCORE_SAVED_EVENT = "mindarena:score-saved";

export default function Leaderboard({ slug }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchLeaderboard(slug)
        .then((data) => {
          if (!cancelled) setRows(data);
        })
        .catch(() => {
          if (!cancelled) setRows([]);
        });
    }
    load();
    window.addEventListener(SCORE_SAVED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(SCORE_SAVED_EVENT, load);
    };
  }, [slug]);

  return (
    <section className="max-w-md mx-auto mt-10">
      <h2 className="text-sm font-semibold text-slate-500 mb-3 text-center">{t("play.leaderboard")}</h2>
      {rows && rows.length === 0 && (
        <p className="text-sm text-slate-400 text-center">{t("play.noScores")}</p>
      )}
      {rows && rows.length > 0 && (
        <ol className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-slate-700">
                <span className="text-slate-400 w-5 inline-block">{index + 1}</span>
                {row.display_name}
              </span>
              <span className="font-semibold text-slate-800">
                {row.points} {t("play.points")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
