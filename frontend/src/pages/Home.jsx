import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGameVisual } from "../components/games/gameVisuals";

const SHELVES = [
  {
    id: "numbers",
    edge: "#ffb000",
    deep: "#e08600",
    chip: "#ffe14a",
    label: "#ffcf33",
    slugs: [
      "sudoku",
      "bolgesel-sudoku",
      "kakuro",
      "carpmaca",
      "futoshiki",
      "islem-karesi",
      "kendoku",
      "sihirli-piramit",
      "apartman",
    ],
  },
  {
    id: "mark",
    edge: "#14c56e",
    deep: "#0b8f4e",
    chip: "#7dffb2",
    label: "#3eea86",
    slugs: [
      "amiral-batti",
      "kare-karalamaca",
      "yildiz-savaslari",
      "cit",
      "patika",
      "abc-baglama",
      "pentominolar",
    ],
  },
  {
    id: "look",
    edge: "#ff3d8a",
    deep: "#c41862",
    chip: "#ff9ec8",
    label: "#ff6aa8",
    slugs: ["colours", "metaforms", "numbers"],
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home-desk">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-2 text-center">
        <h1 className="font-display text-4xl sm:text-6xl font-semibold text-ink leading-[1.05] mb-4 text-balance">
          {t("home.title")}
        </h1>
        <p className="text-base sm:text-lg text-ink/80 max-w-2xl mx-auto leading-relaxed">
          {t("home.subtitle")}
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16 flex flex-col gap-12">
        {SHELVES.map((shelf) => (
          <section key={shelf.id}>
            <h2
              className="home-shelf"
              style={{ background: shelf.label, boxShadow: `0 4px 0 ${shelf.deep}` }}
            >
              {t(`home.${shelf.id}`)}
            </h2>
            <p className="text-ink/80 font-semibold mt-3 mb-4">{t(`home.${shelf.id}_help`)}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shelf.slugs.map((slug, index) => {
                const visual = getGameVisual(slug);
                return (
                  <Link
                    key={slug}
                    to={`/games/${slug}`}
                    className="home-tile card-rise flex flex-col items-center justify-center gap-3 px-3 py-5 font-bold text-ink"
                    style={{
                      "--tile": shelf.edge,
                      "--tile-deep": shelf.deep,
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    <span
                      className="toy-icon text-3xl w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: shelf.chip }}
                      aria-hidden="true"
                    >
                      {visual.emoji}
                    </span>
                    <span className="text-sm text-center">{t(`gameTitle.${slug}`)}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
