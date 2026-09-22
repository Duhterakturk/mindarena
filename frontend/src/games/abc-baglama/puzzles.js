import { shuffle } from "../common/latinSquare";

const CONFIG = {
  easy: { size: 5, pairs: 2, length: 5 },
  medium: { size: 6, pairs: 3, length: 6 },
  hard: { size: 7, pairs: 3, length: 8 },
};
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const LABELS = ["A", "B", "C", "D"];

function inducedStep(rr, cc, path, visited) {
  const [er, ec] = path[path.length - 1];
  return DIRS.every(([dr, dc]) => {
    if (rr + dr === er && cc + dc === ec) return true;
    return !visited.has(`${rr + dr}-${cc + dc}`);
  });
}

function randomPathAvoiding(rows, cols, targetLength, blocked) {
  const free = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!blocked.has(`${r}-${c}`)) free.push([r, c]);
    }
  }
  shuffle(free);
  for (const start of free) {
    const visited = new Set([`${start[0]}-${start[1]}`]);
    const path = [start];
    let steps = 0;
    function search() {
      if (path.length >= targetLength) return true;
      if (steps++ > 2500) return false;
      const [r, c] = path[path.length - 1];
      const candidates = shuffle(DIRS)
        .map(([dr, dc]) => [r + dr, c + dc])
        .filter(
          ([rr, cc]) =>
            rr >= 0 &&
            rr < rows &&
            cc >= 0 &&
            cc < cols &&
            !visited.has(`${rr}-${cc}`) &&
            !blocked.has(`${rr}-${cc}`) &&
            inducedStep(rr, cc, path, visited)
        );
      for (const [nr, nc] of candidates) {
        path.push([nr, nc]);
        visited.add(`${nr}-${nc}`);
        if (search()) return true;
        path.pop();
        visited.delete(`${nr}-${nc}`);
      }
      return false;
    }
    if (search()) return path;
  }
  return [];
}

// ABC Bağlama: birden çok ayrık rastgele öz-kaçınan yol üretilir (A-A, B-B, ...).
// Uç noktalar sabit harf etiketli hücrelerdir; aradaki hücreler tıklanarak
// birleştirilir. Zorluk; ızgara boyutu, çift sayısı ve yol uzunluğuyla ölçeklenir.
export function generate(difficulty = "easy") {
  const { size, pairs, length } = CONFIG[difficulty] || CONFIG.easy;

  for (let attempt = 0; attempt < 30; attempt++) {
    const fixedCells = {};
    const solutionSet = [];
    const blocked = new Set();
    let ok = true;
    for (let i = 0; i < pairs; i++) {
      const path = randomPathAvoiding(size, size, length, blocked);
      if (path.length < length) {
        ok = false;
        break;
      }
      path.forEach(([r, c]) => {
        blocked.add(`${r}-${c}`);
        DIRS.forEach(([dr, dc]) => blocked.add(`${r + dr}-${c + dc}`));
      });
      path.forEach(([r, c], idx) => {
        const key = `${r}-${c}`;
        if (idx === 0 || idx === path.length - 1) fixedCells[key] = LABELS[i];
        solutionSet.push(key);
      });
    }
    if (ok) return { solutionSet, fixedCells, rows: size, cols: size };
  }
  throw new Error("Ayrık Harf Yolu üretilemedi");
}
