// Yıldızlı Sayılar: 3×3, sayılar 1-9 birer kez. Harfler A B C / D E F / G H I.
// Tek yıldızlı harf işleminde yıldızlı kare yazılan işleme eşittir.
// Çok yıldızlı harf işlemi harflerle okunur. Sonuçlu yıldız toplamı veya çarpımı sayıya eşittir.
// Sonuçsuz ★+★=★ ve ★×★=★ sırasızdır: herhangi ikisi üçüncüsünü verir. Bölme tam bölünür.

const LETTERS = "ABCDEFGHI";
const EXTRA = { easy: 2, medium: 1, hard: 0 };

function shuffle(list, random) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

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
    if (clues.some((clue) => lettersIn(clue).every((letter) => cellValue(grid, letter)) && !holds(grid, clue))) return;
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

function lettersIn(clue) {
  if (clue.kind === "equation") return `${clue.left}${clue.right}`.match(/[A-I]/g) || [];
  return clue.cells || [];
}

function at(grid, letter) {
  return cellValue(grid, letter);
}

function cluePool(grid) {
  const clues = [];
  const seen = new Set();
  function add(clue) {
    const signature = JSON.stringify(clue);
    if (seen.has(signature) || !holds(grid, clue)) return;
    seen.add(signature);
    clues.push(clue);
  }

  for (const left of LETTERS) {
    for (const first of LETTERS) {
      if (first === left) continue;
      for (const second of LETTERS) {
        if (second === left || second === first) continue;
        const a = at(grid, first);
        const b = at(grid, second);
        if (a + b === at(grid, left)) add({ kind: "equation", left, right: `${first}+${second}` });
        if (a - b === at(grid, left)) add({ kind: "equation", left, right: `${first}-${second}` });
        if (a * b === at(grid, left)) add({ kind: "equation", left, right: `${first}*${second}` });
        if (b && a % b === 0 && a / b === at(grid, left)) add({ kind: "equation", left, right: `${first}/${second}` });
      }
    }
  }

  for (const a of LETTERS) {
    for (const b of LETTERS) {
      if (a === b || !at(grid, b) || at(grid, a) % at(grid, b) !== 0) continue;
      for (const c of LETTERS) {
        if (c === a || c === b) continue;
        for (const d of LETTERS) {
          if (d === a || d === b || d === c || !at(grid, d) || at(grid, c) % at(grid, d) !== 0) continue;
          if (`${a}${b}` > `${c}${d}`) continue;
          if (at(grid, a) / at(grid, b) !== at(grid, c) / at(grid, d)) continue;
          add({ kind: "equation", left: `${a}/${b}`, right: `${c}/${d}` });
        }
      }
    }
  }

  const lists = [];
  for (let i = 0; i < LETTERS.length; i += 1) {
    for (let j = i + 1; j < LETTERS.length; j += 1) lists.push([LETTERS[i], LETTERS[j]]);
    for (let j = i + 1; j < LETTERS.length; j += 1) {
      for (let k = j + 1; k < LETTERS.length; k += 1) lists.push([LETTERS[i], LETTERS[j], LETTERS[k]]);
    }
  }
  lists.forEach((cells) => {
    const values = cells.map((letter) => at(grid, letter));
    if (cells.length >= 2) add({ kind: "total", cells, target: values.reduce((sum, value) => sum + value, 0) });
    if (cells.length === 3 && unordered(values, "+")) add({ kind: "relation", op: "+", cells });
    if (cells.length === 3 && unordered(values, "*")) add({ kind: "relation", op: "*", cells });
  });
  return clues;
}

export function generate(difficulty = "easy", random = Math.random) {
  const extra = difficulty === "easy" ? 1 + Math.floor(random() * 2) : (EXTRA[difficulty] ?? 0);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
    const solution = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
    const pool = shuffle(cluePool(solution), random);
    const clues = [];
    let unique = false;
    for (const clue of pool) {
      clues.push(clue);
      const found = solve(clues);
      if (found.length === 1) {
        unique = true;
        break;
      }
      if (found.length === 0) clues.pop();
    }
    if (!unique) continue;
    let added = 0;
    for (const clue of pool) {
      if (added >= extra) break;
      if (clues.includes(clue)) continue;
      clues.push(clue);
      added += 1;
    }
    return { clues, solution };
  }
  throw new Error("Sayı bulmacası üretilemedi");
}
