import { shuffle } from "../common/latinSquare";

const ROWS = 5;
const COLS = 5;
const PATH_LENGTH = 5;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function randomPathAvoiding(targetLength, blocked) {
  let best = [];
  for (let attempt = 0; attempt < 200; attempt++) {
    const free = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
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
            rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && !visited.has(`${rr}-${cc}`) && !blocked.has(`${rr}-${cc}`)
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

// ABC Bağlama: iki ayrık rastgele öz-kaçınan yol üretilir (A-A ve B-B).
// Uç noktalar sabit harf etiketli hücrelerdir; aradaki hücreler tıklanarak
// birleştirilir.
export function generate() {
  const pathA = randomPathAvoiding(PATH_LENGTH, new Set());
  const blocked = new Set(pathA.map(([r, c]) => `${r}-${c}`));
  const pathB = randomPathAvoiding(PATH_LENGTH, blocked);

  const fixedCells = {};
  const solutionSet = [];

  function register(path, label) {
    path.forEach(([r, c], idx) => {
      const key = `${r}-${c}`;
      if (idx === 0 || idx === path.length - 1) fixedCells[key] = label;
      solutionSet.push(key);
    });
  }
  register(pathA, "A");
  register(pathB, "B");

  return { solutionSet, fixedCells, rows: ROWS, cols: COLS };
}
