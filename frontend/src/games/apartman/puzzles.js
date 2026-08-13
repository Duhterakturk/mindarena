// 4x4 Apartman (Skyscrapers). Kenar ipuçları (kaç bina görünür), her oynanışta
// yeni üretilen Latin kareden hesaplanır (bkz. Apartman.jsx -> computeClues).
export const GIVENS_BY_DIFFICULTY = { easy: 11, medium: 7, hard: 4 };

function visibleCount(sequence) {
  let count = 0;
  let tallest = 0;
  for (const height of sequence) {
    if (height > tallest) {
      count++;
      tallest = height;
    }
  }
  return count;
}

export function computeClues(solution) {
  const n = solution.length;
  const top = [];
  const bottom = [];
  for (let c = 0; c < n; c++) {
    const col = solution.map((row) => row[c]);
    top.push(visibleCount(col));
    bottom.push(visibleCount([...col].reverse()));
  }
  const left = solution.map((row) => visibleCount(row));
  const right = solution.map((row) => visibleCount([...row].reverse()));
  return { top, bottom, left, right };
}
