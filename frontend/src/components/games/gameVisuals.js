// Her oyun için temsili emoji + soluk mühür rengi. Kartın kendisi kâğıt
// kalır; renk yalnızca küçük bir izdir. Slug listesi GAME_CATALOG ile eşleşir.
export const GAME_VISUALS = {
  kakuro: { emoji: "➕", color: "bg-[#e7f2ea]" },
  sudoku: { emoji: "🔢", color: "bg-[#e7eef8]" },
  "bolgesel-sudoku": { emoji: "🧩", color: "bg-[#eceaf6]" },
  apartman: { emoji: "🏢", color: "bg-[#eeeae4]" },
  cit: { emoji: "🔲", color: "bg-[#e5f1f2]" },
  "amiral-batti": { emoji: "🚢", color: "bg-[#f6e9ea]" },
  "sihirli-piramit": { emoji: "🔺", color: "bg-[#f6efe2]" },
  patika: { emoji: "🛤️", color: "bg-[#e8f1e6]" },
  "abc-baglama": { emoji: "🔤", color: "bg-[#eeeaf4]" },
  "islem-karesi": { emoji: "➗", color: "bg-[#f6eee4]" },
  kendoku: { emoji: "📐", color: "bg-[#e6f1ee]" },
  "yildiz-savaslari": { emoji: "⭐", color: "bg-[#f7f1dc]" },
  "kare-karalamaca": { emoji: "✏️", color: "bg-[#efeae4]" },
  carpmaca: { emoji: "✖️", color: "bg-[#eef3df]" },
  futoshiki: { emoji: "⚖️", color: "bg-[#e7f0f6]" },
  pentominolar: { emoji: "🧱", color: "bg-[#f3eaf1]" },
  metaforms: { emoji: "🧩", color: "bg-[#ece8f4]" },
  numbers: { emoji: "🎲", color: "bg-[#f6eaf0]" },
  colours: { emoji: "🎨", color: "bg-[#f6ebe7]" },
};

export function getGameVisual(slug) {
  return GAME_VISUALS[slug] || { emoji: "🧠", color: "bg-[#eee8dc]" };
}
