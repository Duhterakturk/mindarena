import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGameVisual } from "./gameVisuals";

export default function GameCard({ game }) {
  const { t, i18n } = useTranslation();
  const name = i18n.language === "tr" ? game.name_tr : game.name_en;
  const { emoji, color } = getGameVisual(game.slug);

  return (
    <Link
      to={`/games/${game.slug}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 border border-slate-100"
    >
      <div className={`h-24 rounded-xl flex items-center justify-center text-4xl mb-3 ${color}`}>
        <span aria-hidden="true">{emoji}</span>
      </div>
      <h3 className="font-semibold text-slate-800">{name}</h3>
      <p className="text-xs text-slate-500 mt-1">
        {t("games.min_grade")}: {game.min_grade_level}
      </p>
    </Link>
  );
}
