import { shuffle } from "../common/latinSquare";

const CONFIG = {
  easy: { size: 5, length: 12 },
  medium: { size: 6, length: 16 },
  hard: { size: 7, length: 22 },
};
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function randomPath(rows, cols, targetLength) {
  let best = [];
  for (let attempt = 0; attempt < 300; attempt++) {
    const start = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
    const visited = new Set([`${start[0]}-${start[1]}`]);
    const path = [start];
    while (path.length < targetLength) {
      const [r, c] = path[path.length - 1];
      const candidates = shuffle(DIRS)
        .map(([dr, dc]) => [r + dr, c + dc])
        .filter(([rr, cc]) => rr >= 0 && rr < rows && cc >= 0 && cc < cols && !visited.has(`${rr}-${cc}`));
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

// Patika: rastgele öz-kaçınan bir yol (self-avoiding walk) üretilir; yol
// üzerinde eşit aralıklarla 1-4 numaralı 4 durak sabit hücre olarak verilir,
// aradaki hücreler öğrenci tarafından tıklanarak tamamlanır. Zorluk, ızgara
// boyutu ve yol uzunluğuyla ölçeklenir.
export function generate(difficulty = "easy") {
  const { size, length } = CONFIG[difficulty] || CONFIG.easy;
  const path = randomPath(size, size, length);
  const last = path.length - 1;
  const waypointIndices = [0, Math.round(last / 3), Math.round((2 * last) / 3), last];

  const fixedCells = {};
  waypointIndices.forEach((idx, n) => {
    const [r, c] = path[idx];
    fixedCells[`${r}-${c}`] = String(n + 1);
  });

  const solutionSet = path.map(([r, c]) => `${r}-${c}`);
  return { solutionSet, fixedCells, rows: size, cols: size };
}
