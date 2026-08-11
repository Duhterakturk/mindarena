import { shuffle } from "../common/latinSquare";

const ROWS = 5;
const COLS = 5;
const TARGET_LENGTH = 12;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function randomPath() {
  let best = [];
  for (let attempt = 0; attempt < 300; attempt++) {
    const start = [Math.floor(Math.random() * ROWS), Math.floor(Math.random() * COLS)];
    const visited = new Set([`${start[0]}-${start[1]}`]);
    const path = [start];
    while (path.length < TARGET_LENGTH) {
      const [r, c] = path[path.length - 1];
      const candidates = shuffle(DIRS)
        .map(([dr, dc]) => [r + dr, c + dc])
        .filter(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && !visited.has(`${rr}-${cc}`));
      if (candidates.length === 0) break;
      const [nr, nc] = candidates[0];
      path.push([nr, nc]);
      visited.add(`${nr}-${nc}`);
    }
    if (path.length > best.length) best = path;
    if (best.length >= TARGET_LENGTH) break;
  }
  return best;
}

// Patika: rastgele öz-kaçınan bir yol (self-avoiding walk) üretilir; yol
// üzerinde eşit aralıklarla 1-4 numaralı 4 durak sabit hücre olarak verilir,
// aradaki hücreler öğrenci tarafından tıklanarak tamamlanır.
export function generate() {
  const path = randomPath();
  const last = path.length - 1;
  const waypointIndices = [0, Math.round(last / 3), Math.round((2 * last) / 3), last];

  const fixedCells = {};
  waypointIndices.forEach((idx, n) => {
    const [r, c] = path[idx];
    fixedCells[`${r}-${c}`] = String(n + 1);
  });

  const solutionSet = path.map(([r, c]) => `${r}-${c}`);
  return { solutionSet, fixedCells, rows: ROWS, cols: COLS };
}
