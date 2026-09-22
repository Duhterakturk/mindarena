import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchUnlockedDifficulties } from "../../api/difficulty";

const DEFAULT_STATE = {
  unlocked: { easy: true, medium: false, hard: false },
  progress: { easy: 0, medium: 0, hard: 0 },
  threshold: 5,
};

/**
 * 19 oyunun tamamında kullanılan paylaşılan zorluk seçici. Bir sonraki
 * kademe, o oyunda bir önceki kademede en az `threshold` tamamlama
 * yapılınca açılır (bkz. backend/app/services/difficulty.py). Giriş
 * yapılmamışsa yalnızca "Kolay" kullanılabilir (ilerleme takip edilemez).
 */
export default function DifficultyPicker({ gameSlug, value, onChange }) {
  const { t } = useTranslation();
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    fetchUnlockedDifficulties(gameSlug)
      .then(setState)
      .catch(() => setState(DEFAULT_STATE));
  }, [gameSlug]);

  const order = ["easy", "medium", "hard"];

  return (
    <div className="difficulty-picker flex gap-2 mb-2 flex-wrap items-center">
      {order.map((level) => {
        const isUnlocked = state.unlocked[level];
        const isActive = value === level;
        const prevLevel = order[order.indexOf(level) - 1];
        const lockHint =
          !isUnlocked && prevLevel
            ? t("difficulty.lock", {
                level: t(`difficulty.${prevLevel}`),
                threshold: state.threshold,
                done: state.progress[prevLevel],
              })
            : undefined;

        return (
          <button
            key={level}
            type="button"
            disabled={!isUnlocked}
            title={lockHint}
            onClick={() => isUnlocked && onChange(level)}
            className={[
              "px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1",
              !isUnlocked
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : isActive
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-brand-50",
            ].join(" ")}
          >
            {!isUnlocked && <span aria-hidden="true">🔒</span>}
            {t(`difficulty.${level}`)}
          </button>
        );
      })}
    </div>
  );
}
