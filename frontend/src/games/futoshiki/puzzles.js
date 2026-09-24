import { shuffle, generateLatinSquare } from "../common/latinSquare";

const SIZES = { easy: [4], medium: [5, 4], hard: [5, 4] };
const KEEP = { easy: 0.45, medium: 0.75, hard: 1 };

function signsOf(solution) {
  const horizontal = [];
  const vertical = [];
  const n = solution.length;
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n - 1; col += 1) {
      horizontal.push({ r: row, c: col, sign: solution[row][col] < solution[row][col + 1] ? "<" : ">" });
    }
  }
  for (let row = 0; row < n - 1; row += 1) {
    for (let col = 0; col < n; col += 1) {
      vertical.push({ r: row, c: col, sign: solution[row][col] > solution[row + 1][col] ? "v" : "^" });
    }
  }
  return { horizontal, vertical };
}

function countBoards(puzzle, horizontal, vertical, limit = 2) {
  const n = puzzle.length;
  const grid = puzzle.map((row) => row.slice());
  const rows = Array.from({ length: n }, () => Array(n + 1).fill(false));
  const cols = Array.from({ length: n }, () => Array(n + 1).fill(false));
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      const value = grid[row][col];
      if (!value) continue;
      if (rows[row][value] || cols[col][value]) return 0;
      rows[row][value] = cols[col][value] = true;
    }
  }
  let count = 0;
  let nodes = 0;

  function broken() {
    return horizontal.some(({ r, c, sign }) => grid[r][c] && grid[r][c + 1] && (sign === "<" ? grid[r][c] >= grid[r][c + 1] : grid[r][c] <= grid[r][c + 1]))
      || vertical.some(({ r, c, sign }) => grid[r][c] && grid[r + 1][c] && (sign === "v" ? grid[r][c] <= grid[r + 1][c] : grid[r][c] >= grid[r + 1][c]));
  }

  function search() {
    if (count >= limit || nodes > 20000) return;
    nodes += 1;
    if (broken()) return;
    let best = null;
    let choices = null;
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        if (grid[row][col]) continue;
        const list = [];
        for (let value = 1; value <= n; value += 1) if (!rows[row][value] && !cols[col][value]) list.push(value);
        if (!choices || list.length < choices.length) {
          best = [row, col];
          choices = list;
          if (!list.length) break;
        }
      }
    }
    if (!best) {
      count += 1;
      return;
    }
    if (!choices.length) return;
    const [row, col] = best;
    choices.forEach((value) => {
      if (count >= limit) return;
      rows[row][value] = cols[col][value] = true;
      grid[row][col] = value;
      search();
      grid[row][col] = 0;
      rows[row][value] = cols[col][value] = false;
    });
  }

  search();
  if (nodes > 20000 && count < limit) return limit;
  return count;
}

function simplify(size, difficulty, random, deadline) {
  const solution = generateLatinSquare(size);
  const puzzle = solution.map((row) => row.slice());
  let { horizontal, vertical } = signsOf(solution);
  const items = [
    ...horizontal.map((sign) => ({ kind: "h", sign })),
    ...vertical.map((sign) => ({ kind: "v", sign })),
    ...puzzle.flatMap((row, r) => row.map((_, c) => ({ kind: "g", r, c }))),
  ];
  const stop = Math.floor(items.length * (KEEP[difficulty] ?? 1));
  let removed = 0;
  shuffle(items).forEach((item) => {
    if (removed >= stop || Date.now() >= deadline) return;
    const previousH = horizontal;
    const previousV = vertical;
    const previousValue = item.kind === "g" ? puzzle[item.r][item.c] : 0;
    if (item.kind === "h") horizontal = horizontal.filter((sign) => sign !== item.sign);
    else if (item.kind === "v") vertical = vertical.filter((sign) => sign !== item.sign);
    else puzzle[item.r][item.c] = 0;
    if (countBoards(puzzle, horizontal, vertical) === 1) removed += 1;
    else {
      horizontal = previousH;
      vertical = previousV;
      if (item.kind === "g") puzzle[item.r][item.c] = previousValue;
    }
  });
  if (countBoards(puzzle, horizontal, vertical) !== 1) return null;
  return { puzzle, solution, horizontal, vertical, size };
}

export function generate(difficulty = "easy", random = Math.random) {
  const deadline = Date.now() + 2800;
  const sizes = SIZES[difficulty] || SIZES.easy;
  for (const size of sizes) {
    const puzzle = simplify(size, difficulty, random, deadline);
    if (puzzle) return puzzle;
    if (Date.now() >= deadline) break;
  }
  const solution = generateLatinSquare(4);
  const signed = signsOf(solution);
  return { puzzle: solution.map((row) => row.slice()), solution, ...signed, size: 4 };
}
