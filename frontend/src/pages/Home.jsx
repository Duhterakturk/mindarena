import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGameVisual } from "../components/games/gameVisuals";

const HIGHLIGHT_SLUGS = ["sudoku", "amiral-batti", "pentominolar", "yildiz-savaslari", "kakuro", "colours"];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-4 text-center">
        <h1 className="font-display text-4xl sm:text-6xl font-semibold text-ink leading-[1.05] mb-4 text-balance">
          {t("home.title")}
        </h1>
        <p className="text-lg text-stone-600 mb-8">{t("home.subtitle")}</p>
        <Link to="/games" className="press-btn">
          {t("home.cta")}
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 pt-14 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {HIGHLIGHT_SLUGS.map((slug, index) => {
            const visual = getGameVisual(slug);
            return (
              <Link
                key={slug}
                to={`/games/${slug}`}
                className="board-card card-rise flex flex-col items-center justify-center gap-3 px-4 py-7 font-bold text-ink"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <span className={`toy-icon text-3xl w-14 h-14 rounded-2xl flex items-center justify-center ${visual.color}`} aria-hidden="true">{visual.emoji}</span>
                <span className="text-sm text-center">{t(`gameTitle.${slug}`)}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
