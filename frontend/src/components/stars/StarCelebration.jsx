import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { STARS_EVENT } from "../../api/games";
import { useAuth } from "../../context/AuthContext";

export default function StarCelebration() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stars, setStars] = useState(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    function onStars(event) {
      const detail = event.detail;
      if (!detail?.pieces) return;
      setStars(detail);
      setShown(0);
    }
    window.addEventListener(STARS_EVENT, onStars);
    return () => window.removeEventListener(STARS_EVENT, onStars);
  }, []);

  useEffect(() => {
    if (!stars || shown >= stars.pieces.length) return undefined;
    const timer = window.setTimeout(() => setShown((count) => count + 1), 280);
    return () => window.clearTimeout(timer);
  }, [stars, shown]);

  if (!stars) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40" data-testid="star-card">
      {stars.new_record && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" data-testid="confetti">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="absolute top-0 h-2 w-2 rounded-sm"
              style={{
                left: `${(index * 17) % 100}%`,
                background: ["#e11d48", "#f59e0b", "#16a34a", "#2563eb"][index % 4],
                animation: `star-fall ${900 + (index % 5) * 180}ms ease-in forwards`,
              }}
            />
          ))}
        </div>
      )}
      <div className="relative bg-white text-slate-900 rounded-2xl shadow-xl px-6 py-5 max-w-sm w-full text-center">
        <p className="font-bold text-lg mb-3">{t("stars.title")}</p>
        <div className="flex flex-wrap justify-center gap-1 text-2xl mb-3">
          {stars.pieces.map((piece, index) => (
            <span key={`${piece}-${index}`} className={index < shown ? "opacity-100" : "opacity-20"}>⭐</span>
          ))}
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          {[...new Set(stars.pieces.slice(0, shown))].map((piece) => (
            <li key={piece}>{t(`stars.${piece}`)}</li>
          ))}
        </ul>
        {stars.new_record && (
          <p className="mt-3 font-semibold text-amber-700" data-testid="record-note">
            {t("stars.record", { seconds: stars.improved_by })}
          </p>
        )}
        {stars.stage_up && <p className="mt-3 font-semibold text-amber-700">{t("owl.grew")}</p>}
        {stars.new_title && (
          <p className="mt-2 text-sm font-semibold">{t("titles.earned", { rank: t(`titles.${stars.new_title.rank}`) })}</p>
        )}
        {stars.new_certificate && <p className="mt-2 font-semibold text-amber-700">{t("certs.earned")}</p>}
        {!user && <p className="mt-3 text-sm text-slate-500">{t("stars.login")}</p>}
        <button type="button" className="mt-4 text-sm font-semibold text-brand-700" onClick={() => setStars(null)}>
          {t("stars.close")}
        </button>
      </div>
      <style>{`@keyframes star-fall { to { transform: translateY(70vh) rotate(180deg); opacity: 0.2; } }`}</style>
    </div>
  );
}
