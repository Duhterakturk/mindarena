import { shuffle } from "../common/latinSquare";

// Yıldız Dizilimi: her satır, sütun ve bölgede bir yıldız; yıldızlar
// birbirine (çapraz dahil) değmez. Bölgeler, yerleştirilen yıldızlardan
// büyütülür. Mümkünse tek çözümlü bir bölme seçilir.
const SIZE_BY_DIFFICULTY = { easy: 5, medium: 6, hard: 7 };

function starsTouch(cols) {
  for (let r = 0; r < cols.length; r++) {
    for (let r2 = r + 1; r2 < cols.length; r2++) {
      if (Math.abs(r - r2) <= 1 && Math.abs(cols[r] - cols[r2]) <= 1) return true;
    }
  }
  return false;
}

function placeStars(n) {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const cols = shuffle(Array.from({ length: n }, (_, i) => i));
    if (!starsTouch(cols)) return cols;
  }
  return null;
}

function growRegions(cols, n) {
  const region = Array.from({ length: n }, () => Array(n).fill(-1));
  const queue = cols.map((c, r) => [r, c, r]);
  cols.forEach((c, r) => {
    region[r][c] = r;
  });
  let head = 0;
  while (head < queue.length) {
    const swap = head + Math.floor(Math.random() * (queue.length - head));
    [queue[head], queue[swap]] = [queue[swap], queue[head]];
    const [r, c, id] = queue[head++];
    const next = shuffle([
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ]).filter(([rr, cc]) => rr >= 0 && cc >= 0 && rr < n && cc < n && region[rr][cc] === -1);
    for (const [rr, cc] of next) {
      region[rr][cc] = id;
      queue.push([rr, cc, id]);
    }
  }
  return region;
}

export function countSolutions(region, n, limit = 2) {
  const colUsed = Array(n).fill(false);
  const regionUsed = Array(n).fill(false);
  let count = 0;

  function search(row) {
    if (count >= limit) return;
    if (row === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (colUsed[c] || regionUsed[region[row][c]]) continue;
      if (row > 0 && Math.abs(search.prev[row - 1] - c) <= 1) continue;
      colUsed[c] = true;
      regionUsed[region[row][c]] = true;
      search.prev[row] = c;
      search(row + 1);
      colUsed[c] = false;
      regionUsed[region[row][c]] = false;
      if (count >= limit) return;
    }
  }
  search.prev = [];
  search(0);
  return count;
}

function pack(cols, region, n) {
  return {
    solutionSet: cols.map((c, r) => `${r}-${c}`),
    regionGrid: region,
    rowClues: Array(n).fill(1),
    colClues: Array(n).fill(1),
    size: n,
  };
}

export function generate(difficulty = "easy") {
  const n = SIZE_BY_DIFFICULTY[difficulty] || 5;
  for (let attempt = 0; attempt < 80; attempt++) {
    const cols = placeStars(n);
    if (!cols) break;
    const region = growRegions(cols, n);
    if (countSolutions(region, n) === 1) return pack(cols, region, n);
  }
  throw new Error("Tek çözüm Yıldız Dizilimi üretilemedi");
}
