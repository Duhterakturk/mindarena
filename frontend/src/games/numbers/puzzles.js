// Numbers: yıldızlı kareler alttaki işleme soldan sağa, yukarıdan aşağı girer.
// Kolayda 3×3, diğerlerinde kitabın 4×4 karesi. Sayılar 1-9.

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
  if (clue.op === "ratio") return values[1] && values[3] && values[0] * values[3] === values[1] * values[2];
  return false;
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
  if (size === 4) {
    const ratio = order.slice(0, 4);
    const values = read(solution, ratio);
    if (values[1] && values[3] && values[0] * values[3] === values[1] * values[2]) {
      clues.push(makeClue("ratio", ratio, solution));
    }
  }
  if (propagate(size, clues, givens) !== 1) throw new Error("Sayı bulmacası üretilemedi");
  return { givens, clues, solution };
}
