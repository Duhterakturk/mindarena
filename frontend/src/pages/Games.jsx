import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchGames } from "../api/games";
import GameCard from "../components/games/GameCard";

export default function Games() {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch(() => setError("Oyunlar yüklenemedi. Backend çalışıyor mu?"));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("games.title")}</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
