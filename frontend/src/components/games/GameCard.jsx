import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HowTo from "./HowTo";
import { getGameVisual } from "./gameVisuals";

export default function GameCard({ game, index = 0 }) {
  const { t, i18n } = useTranslation();
  const name = i18n.language === "tr" ? game.name_tr : game.name_en;
  const { emoji, color } = getGameVisual(game.slug);

  return (
    <div
      className="board-card card-rise relative text-ink"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <Link to={`/games/${game.slug}`} className="block p-4 pr-12">
        <div className={`h-20 rounded-2xl flex items-center justify-center text-4xl mb-3 ${color}`}>
          <span className="toy-icon" aria-hidden="true">{emoji}</span>
        </div>
        <h3 className="font-bold">{name}</h3>
        <p className="text-xs text-stone-500 mt-1">
          {t("games.min_grade")}: {game.min_grade_level}
        </p>
      </Link>
      <HowTo slug={game.slug} className="absolute bottom-4 right-3" />
    </div>
  );
}
