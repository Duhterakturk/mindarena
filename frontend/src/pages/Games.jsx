import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchGames } from "../api/games";
import GameCard from "../components/games/GameCard";

export default function Games() {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchGames()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => {
        setError(t("games.loadError"));
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h1 className="font-display text-4xl font-semibold">{t("games.title")}</h1>
        <Link to="/exam" className="press-btn text-sm" style={{ padding: "0.55rem 1rem" }}>
          Karışık deneme
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading && (
        <>
          {slow && (
            <p className="text-slate-500 text-sm mb-4">
              {t("games.waking")}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#fffdf8] rounded-2xl p-5 border border-line animate-pulse">
                <div className="h-24 rounded-xl bg-slate-100 mb-3" />
                <div className="h-4 w-2/3 rounded bg-slate-100 mb-2" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
          {games.map((game, index) => (
            <GameCard key={game.slug} game={game} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
