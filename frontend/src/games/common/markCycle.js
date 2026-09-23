// Boş → işaret → çarpı → boş. Çözüme yalnızca "işaret" gider.
export function nextMarkState(state) {
  if (state === "mark") return "cross";
  if (state === "cross") return "empty";
  return "mark";
}

export function cellMarkState(marked, crossed, key) {
  if (marked.has(key)) return "mark";
  if (crossed.has(key)) return "cross";
  return "empty";
}

export function applyMarkCycle(marked, crossed, key) {
  const nextMarked = new Set(marked);
  const nextCrossed = new Set(crossed);
  const state = cellMarkState(marked, crossed, key);
  const next = nextMarkState(state);
  nextMarked.delete(key);
  nextCrossed.delete(key);
  if (next === "mark") nextMarked.add(key);
  if (next === "cross") nextCrossed.add(key);
  return { marked: nextMarked, crossed: nextCrossed };
}

export function nextEdgeState(value) {
  if (value === true) return "x";
  if (value === "x") return false;
  return true;
}

export function edgeIsDrawn(value) {
  return value === true;
}
