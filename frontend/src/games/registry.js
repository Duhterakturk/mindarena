import { lazy } from "react";

/**
 * Modüler oyun kayıt sistemi. Her yeni oyun buraya bir giriş eklenerek
 * ve `src/games/<slug>/` altında kendi component'i oluşturularak eklenir.
 * Backend'deki slug (app/models/game.py -> GAME_CATALOG) ile birebir eşleşmelidir.
 */
const registry = {
  sudoku: lazy(() => import("./sudoku/Sudoku")),
  kakuro: lazy(() => import("./kakuro/Kakuro")),
  "bolgesel-sudoku": lazy(() => import("./bolgesel-sudoku/BolgeselSudoku")),
  apartman: lazy(() => import("./apartman/Apartman")),
  "islem-karesi": lazy(() => import("./islem-karesi/IslemKaresi")),
  kendoku: lazy(() => import("./kendoku/Kendoku")),
  futoshiki: lazy(() => import("./futoshiki/Futoshiki")),
  carpmaca: lazy(() => import("./carpmaca/Carpmaca")),
  "amiral-batti": lazy(() => import("./amiral-batti/AmiralBatti")),
  "yildiz-savaslari": lazy(() => import("./yildiz-savaslari/YildizSavaslari")),
  cit: lazy(() => import("./cit/Cit")),
  patika: lazy(() => import("./patika/Patika")),
  "abc-baglama": lazy(() => import("./abc-baglama/AbcBaglama")),
  pentominolar: lazy(() => import("./pentominolar/Pentominolar")),
  "sihirli-piramit": lazy(() => import("./sihirli-piramit/SihirliPiramit")),
  "kare-karalamaca": lazy(() => import("./kare-karalamaca/KareKaralamaca")),
  metaforms: lazy(() => import("./metaforms/Metaforms")),
  numbers: lazy(() => import("./numbers/Numbers")),
  colours: lazy(() => import("./colours/Colours")),
};

export function getGameComponent(slug) {
  return registry[slug] || null;
}

export default registry;
