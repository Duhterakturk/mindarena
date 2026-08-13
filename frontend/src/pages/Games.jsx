import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchGames } from "../api/games";
import GameCard from "../components/games/GameCard";

export default function Games() {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Oyunlar yüklenemedi. Backend çalışıyor mu?");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("games.title")}</h1>

      {error && <p className="text-red-500">{error}</p>}

      {loading && (
        <>
          <p className="text-slate-500 text-sm mb-4">
            Oyunlar yükleniyor — sunucu bir süredir kullanılmadıysa uyanması birkaç saniye sürebilir…
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                <div className="h-24 rounded-xl bg-slate-100 mb-3" />
                <div className="h-4 w-2/3 rounded bg-slate-100 mb-2" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
