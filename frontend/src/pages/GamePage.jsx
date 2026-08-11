import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { getGameComponent } from "../games/registry";

export default function GamePage() {
  const { slug } = useParams();
  const GameComponent = getGameComponent(slug);

  if (!GameComponent) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-600">
        Bu oyun modülü henüz eklenmedi. (`src/games/{slug}/`)
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Suspense fallback={<p>Yükleniyor...</p>}>
        <GameComponent />
      </Suspense>
    </div>
  );
}
