import { shuffle } from "../common/latinSquare";

const CONFIG = {
  easy: { size: 5, pairs: 2, length: 5 },
  medium: { size: 6, pairs: 3, length: 6 },
  hard: { size: 7, pairs: 3, length: 8 },
};
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const LABELS = ["A", "B", "C", "D"];

function randomPathAvoiding(rows, cols, targetLength, blocked) {
  let best = [];
  for (let attempt = 0; attempt < 200; attempt++) {
    const free = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!blocked.has(`${r}-${c}`)) free.push([r, c]);
      }
    }
    if (free.length === 0) return [];
    const start = free[Math.floor(Math.random() * free.length)];
    const visited = new Set([`${start[0]}-${start[1]}`]);
    const path = [start];
    while (path.length < targetLength) {
      const [r, c] = path[path.length - 1];
      const candidates = shuffle(DIRS)
        .map(([dr, dc]) => [r + dr, c + dc])
        .filter(
          ([rr, cc]) =>
            rr >= 0 && rr < rows && cc >= 0 && cc < cols && !visited.has(`${rr}-${cc}`) && !blocked.has(`${rr}-${cc}`)
        );
      if (candidates.length === 0) break;
      const [nr, nc] = candidates[0];
      path.push([nr, nc]);
      visited.add(`${nr}-${nc}`);
    }
    if (path.length > best.length) best = path;
    if (best.length >= targetLength) break;
  }
  return best;
}

// ABC Bağlama: birden çok ayrık rastgele öz-kaçınan yol üretilir (A-A, B-B, ...).
// Uç noktalar sabit harf etiketli hücrelerdir; aradaki hücreler tıklanarak
// birleştirilir. Zorluk; ızgara boyutu, çift sayısı ve yol uzunluğuyla ölçeklenir.
export function generate(difficulty = "easy") {
  const { size, pairs, length } = CONFIG[difficulty] || CONFIG.easy;

  const fixedCells = {};
  const solutionSet = [];
  const blocked = new Set();

  for (let i = 0; i < pairs; i++) {
    const path = randomPathAvoiding(size, size, length, blocked);
    path.forEach(([r, c]) => blocked.add(`${r}-${c}`));
    path.forEach(([r, c], idx) => {
      const key = `${r}-${c}`;
      if (idx === 0 || idx === path.length - 1) fixedCells[key] = LABELS[i];
      solutionSet.push(key);
    });
  }

  return { solutionSet, fixedCells, rows: size, cols: size };
}
