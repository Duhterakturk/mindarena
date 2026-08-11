import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GameCard({ game }) {
  const { t, i18n } = useTranslation();
  const name = i18n.language === "tr" ? game.name_tr : game.name_en;

  return (
    <Link
      to={`/games/${game.slug}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 border border-slate-100"
    >
      <div className="h-24 rounded-xl bg-brand-100 flex items-center justify-center text-3xl font-bold text-brand-600 mb-3">
        {name.charAt(0)}
      </div>
      <h3 className="font-semibold text-slate-800">{name}</h3>
      <p className="text-xs text-slate-500 mt-1">
        {t("games.min_grade")}: {game.min_grade_level}
      </p>
    </Link>
  );
}
