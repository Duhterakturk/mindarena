import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGameVisual } from "../components/games/gameVisuals";

const HIGHLIGHT_SLUGS = ["sudoku", "amiral-batti", "pentominolar", "yildiz-savaslari", "kakuro", "colours"];

const STATS = [
  { value: "19", label: "Farklı Oyun" },
  { value: "3", label: "Zorluk Kademesi" },
  { value: "∞", label: "Sonsuz Bulmaca" },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <p className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-stone-500 mb-4">
          2. sınıftan itibaren
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-semibold text-ink leading-[1.05] mb-5 text-balance">
          {t("home.title")}
        </h1>
        <p className="text-lg text-stone-600 mb-8 max-w-xl mx-auto">{t("home.subtitle")}</p>
        <Link to="/games" className="press-btn">
          {t("home.cta")}
        </Link>

        <div className="mt-10 flex justify-center gap-3" aria-hidden="true">
          {HIGHLIGHT_SLUGS.map((slug, index) => {
            const visual = getGameVisual(slug);
            return (
              <span
                key={slug}
                className={`toy w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-line ${visual.color}`}
                style={{ animationDelay: `${index * 180}ms` }}
              >
                {visual.emoji}
              </span>
            );
          })}
        </div>

        <dl className="mt-14 grid grid-cols-3 border-y border-line">
          {STATS.map((item) => (
            <div key={item.label} className="py-5">
              <dt className="font-display text-3xl font-semibold text-ink">{item.value}</dt>
              <dd className="text-xs text-stone-500 mt-1">{item.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="font-display text-center text-2xl text-ink mb-8">Bazı oyunlarımızla tanış</h2>
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
