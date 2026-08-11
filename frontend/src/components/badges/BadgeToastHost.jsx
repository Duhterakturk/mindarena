import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BADGES_EARNED_EVENT } from "../../api/games";

const DISPLAY_MS = 5000;

/**
 * `App.jsx` içinde tek sefer mount edilir. Herhangi bir oyun `submitScore()`
 * çağırdığında ve yeni rozet kazanıldığında (bkz. api/games.js), global bir
 * olay üzerinden bildirim alır ve sağ altta bir toast gösterir. Bu sayede
 * 19 oyun bileşeninin hiçbiri değiştirilmeden rozet bildirimi eklenmiş olur.
 */
export default function BadgeToastHost() {
  const { i18n } = useTranslation();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleBadgesEarned(event) {
      const badges = event.detail || [];
      const withIds = badges.map((badge) => ({ ...badge, _toastId: `${badge.slug}-${Date.now()}-${Math.random()}` }));
      setToasts((prev) => [...prev, ...withIds]);
      withIds.forEach((badge) => {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t._toastId !== badge._toastId));
        }, DISPLAY_MS);
      });
    }

    window.addEventListener(BADGES_EARNED_EVENT, handleBadgesEarned);
    return () => window.removeEventListener(BADGES_EARNED_EVENT, handleBadgesEarned);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((badge) => (
        <div
          key={badge._toastId}
          className="bg-white border border-amber-200 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 max-w-xs"
        >
          <span className="text-3xl">{badge.icon}</span>
          <div>
            <p className="text-xs text-amber-600 font-semibold">Yeni Rozet!</p>
            <p className="text-sm font-bold text-slate-800">
              {i18n.language === "tr" ? badge.name_tr : badge.name_en}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
