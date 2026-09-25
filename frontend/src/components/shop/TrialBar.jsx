import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { buyItem } from "../../api/shop";
import { clearTrial, currentTrial, rememberEquipped, subscribeTrial, trialKeeps } from "./themeTrial";

export default function TrialBar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [trial, setTrial] = useState(currentTrial);
  const [balance, setBalance] = useState(null);
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";

  useEffect(() => subscribeTrial(setTrial), []);

  useEffect(() => {
    if (trial && !trialKeeps(location.pathname)) clearTrial();
  }, [location.pathname, trial]);

  useEffect(() => {
    function onStars(event) {
      if (typeof event.detail?.star_balance === "number") setBalance(event.detail.star_balance);
    }
    window.addEventListener("mindarena:stars", onStars);
    return () => window.removeEventListener("mindarena:stars", onStars);
  }, []);

  if (!trial || trial.type === "accessory") return null;
  const name = lang === "en" ? trial.name_en : trial.name_tr;
  const short = balance == null ? 0 : Math.max(0, trial.price - balance);

  async function buy() {
    const next = await buyItem(trial.id);
    rememberEquipped(next.items || []);
    clearTrial();
  }

  return (
    <div className="relative z-[1] w-full bg-[#1c1c1c] flex flex-wrap items-center justify-center gap-2 px-3 py-2 text-sm text-white" data-testid="theme-trial">
        <span>{t("shop.trying", { name })}</span>
        {short > 0 ? (
          <span>{t("shop.short", { count: trial.price })}</span>
        ) : (
          <button type="button" className="rounded-lg bg-white px-2 py-1 font-semibold text-slate-900" onClick={buy}>
            {t("shop.buy")} ⭐{trial.price}
          </button>
        )}
        <button type="button" className="rounded-lg border border-white/40 px-2 py-1" onClick={() => clearTrial()}>
          {t("shop.cancel")}
        </button>
    </div>
  );
}
