// Yıldızlı Sayılar: 3×3, sayılar 1-9 birer kez. Harfler A B C / D E F / G H I.
// Tek yıldızlı harf işleminde yıldızlı kare yazılan işleme eşittir.
// Çok yıldızlı harf işlemi harflerle okunur. Sonuçlu yıldız toplamı veya çarpımı sayıya eşittir.
// Sonuçsuz ★+★=★ ve ★×★=★ sırasızdır: herhangi ikisi üçüncüsünü verir. Bölme tam bölünür.

const SIZE = { easy: 3, medium: 4, hard: 4 };

function shuffle(list, random) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function key(row, col) {
  return `${row}-${col}`;
}

function read(grid, cells) {
  return cells.map((cell) => {
    const [row, col] = cell.split("-").map(Number);
    return grid[row][col];
  });
}

export function clueHolds(grid, clue) {
  const values = read(grid, clue.cells);
  if (values.some((value) => !value)) return false;
  if (clue.op === "sum") return values.reduce((total, value) => total + value, 0) === clue.target;
  if (clue.op === "product") return values.reduce((total, value) => total * value, 1) === clue.target;
  if (clue.op === "diff") return values[0] - values[1] === clue.target;
  if (clue.op === "ratio") return values[1] && values[3] && values[0] % values[1] === 0 && values[2] % values[3] === 0 && values[0] / values[1] === values[2] / values[3];
  return false;
}

const LETTERS = "ABCDEFGHI";

function cellValue(grid, letter) {
  const index = LETTERS.indexOf(letter);
  if (index < 0) return null;
  const value = grid[Math.floor(index / 3)][index % 3];
  return value || null;
}

function evalSide(grid, text) {
  const raw = String(text).replace(/\s/g, "").replace("×", "*").replace("−", "-");
  if (/^[A-I]$/.test(raw)) return cellValue(grid, raw);
  const match = raw.match(/^([A-I])([+\-*/])([A-I])$/);
  if (!match) return null;
  const left = cellValue(grid, match[1]);
  const right = cellValue(grid, match[3]);
  if (!left || !right) return null;
  if (match[2] === "+") return left + right;
  if (match[2] === "-") return left - right;
  if (match[2] === "*") return left * right;
  if (left % right !== 0) return null;
  return left / right;
}

function unordered(values, op) {
  const [a, b, c] = values;
  if (op === "*") return a * b === c || a * c === b || b * c === a;
  return a + b === c || a + c === b || b + c === a;
}

export function holds(grid, clue) {
  if (clue.kind === "equation") {
    const left = evalSide(grid, clue.left);
    const right = evalSide(grid, clue.right);
    return left !== null && left === right;
  }
  const values = (clue.cells || []).map((letter) => cellValue(grid, letter));
  if (values.some((value) => !value)) return false;
  if (clue.kind === "total") return values.reduce((sum, value) => sum + value, 0) === clue.target;
  if (clue.kind === "relation") return values.length === 3 && unordered(values, clue.op);
  return false;
}

export function solve(clues) {
  const grid = [0, 0, 0].map(() => [0, 0, 0]);
  const used = Array(10).fill(false);
  const found = [];

  function place(index) {
    if (found.length > 1) return;
    if (index === 9) {
      if (clues.every((clue) => holds(grid, clue))) found.push(grid.map((row) => row.slice()));
      return;
    }
    const row = Math.floor(index / 3);
    const col = index % 3;
    for (let digit = 1; digit <= 9; digit += 1) {
      if (used[digit]) continue;
      used[digit] = true;
      grid[row][col] = digit;
      place(index + 1);
      grid[row][col] = 0;
      used[digit] = false;
      if (found.length > 1) return;
    }
  }

  place(0);
  return found;
}

function textFor(clue) {
  if (clue.op === "sum") return `${clue.cells.map(() => "★").join("+")}=${clue.target}`;
  if (clue.op === "product") return "★×★=" + clue.target;
  if (clue.op === "diff") return `★−★=${clue.target}`;
  return "A/B = C/D";
}

function makeClue(op, cells, grid) {
  const values = read(grid, cells);
  const clue = { op, cells: cells.slice() };
  if (op === "sum") clue.target = values.reduce((total, value) => total + value, 0);
  if (op === "product") clue.target = values[0] * values[1];
  if (op === "diff") clue.target = values[0] - values[1];
  clue.text = textFor(clue);
  return clue;
}

function propagate(size, clues, givens) {
  const domains = {};
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = key(row, col);
      domains[cell] = givens[row][col] ? new Set([givens[row][col]]) : new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const clue of clues) {
      if (clue.op === "ratio") continue;
      const unknown = clue.cells.filter((cell) => domains[cell].size !== 1);
      if (unknown.length !== 1) continue;
      const known = clue.cells.filter((cell) => cell !== unknown[0]).map((cell) => [...domains[cell]][0]);
      let required = null;
      if (clue.op === "sum") required = clue.target - known.reduce((total, value) => total + value, 0);
      if (clue.op === "product") {
        const product = known.reduce((total, value) => total * value, 1);
        if (product && clue.target % product === 0) required = clue.target / product;
      }
      if (clue.op === "diff") {
        required = clue.cells[0] === unknown[0] ? clue.target + known[0] : known[0] - clue.target;
      }
      const domain = domains[unknown[0]];
      if (!Number.isInteger(required) || !domain.has(required)) return 0;
      if (domain.size !== 1) {
        domains[unknown[0]] = new Set([required]);
        changed = true;
      }
    }
  }
  return Object.values(domains).every((domain) => domain.size === 1) ? 1 : 2;
}

export function countGrids(clues, givens, limit = 2) {
  const size = givens.length;
  const found = propagate(size, clues, givens);
  return found === 1 ? 1 : Math.min(limit, 2);
}

export function generate(difficulty = "easy", random = Math.random) {
  const size = SIZE[difficulty] || 4;
  const solution = Array.from({ length: size }, () => (
    Array.from({ length: size }, () => 1 + Math.floor(random() * 9))
  ));
  const order = shuffle(
    Array.from({ length: size }, (_, row) => Array.from({ length: size }, (__, col) => key(row, col))).flat(),
    random,
  );
  const givens = solution.map((row) => row.map(() => 0));
  const [startRow, startCol] = order[0].split("-").map(Number);
  givens[startRow][startCol] = solution[startRow][startCol];
  const clues = [];
  for (let index = 1; index < order.length; index += 1) {
    const pair = [order[index - 1], order[index]];
    const values = read(solution, pair);
    let op = "sum";
    if (values[0] > values[1] && random() < 0.35) op = "diff";
    else if (values[0] * values[1] <= 36 && random() < 0.3) op = "product";
    const cells = op === "diff" || op === "product" ? pair : pair.slice().sort();
    clues.push(makeClue(op, cells, solution));
  }
  if (propagate(size, clues, givens) !== 1) throw new Error("Sayı bulmacası üretilemedi");
  return { givens, clues, solution };
}
