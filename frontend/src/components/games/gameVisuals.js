// Her oyun için temsili emoji + renk eşlemesi. Oyun kartlarında ve
// önizlemelerde tek harfli avatar yerine kullanılır. Slug listesi
// backend/app/models/game.py -> GAME_CATALOG ile birebir eşleşir.
export const GAME_VISUALS = {
  kakuro: { emoji: "➕", color: "bg-emerald-100 text-emerald-700" },
  sudoku: { emoji: "🔢", color: "bg-blue-100 text-blue-700" },
  "bolgesel-sudoku": { emoji: "🧩", color: "bg-indigo-100 text-indigo-700" },
  apartman: { emoji: "🏢", color: "bg-slate-100 text-slate-700" },
  cit: { emoji: "🔲", color: "bg-cyan-100 text-cyan-700" },
  "amiral-batti": { emoji: "🚢", color: "bg-rose-100 text-rose-700" },
  "sihirli-piramit": { emoji: "🔺", color: "bg-amber-100 text-amber-700" },
  patika: { emoji: "🛤️", color: "bg-green-100 text-green-700" },
  "abc-baglama": { emoji: "🔤", color: "bg-violet-100 text-violet-700" },
  "islem-karesi": { emoji: "➗", color: "bg-orange-100 text-orange-700" },
  kendoku: { emoji: "📐", color: "bg-teal-100 text-teal-700" },
  "yildiz-savaslari": { emoji: "⭐", color: "bg-yellow-100 text-yellow-700" },
  "kare-karalamaca": { emoji: "✏️", color: "bg-stone-100 text-stone-700" },
  carpmaca: { emoji: "✖️", color: "bg-lime-100 text-lime-700" },
  futoshiki: { emoji: "⚖️", color: "bg-sky-100 text-sky-700" },
  pentominolar: { emoji: "🧱", color: "bg-fuchsia-100 text-fuchsia-700" },
  metaforms: { emoji: "🔷", color: "bg-purple-100 text-purple-700" },
  numbers: { emoji: "🎲", color: "bg-pink-100 text-pink-700" },
  colours: { emoji: "🎨", color: "bg-red-100 text-red-700" },
};

export function getGameVisual(slug) {
  return GAME_VISUALS[slug] || { emoji: "🧠", color: "bg-brand-100 text-brand-700" };
}
