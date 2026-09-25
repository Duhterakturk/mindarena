const CONFIG = {
  easy: { size: 6, min: 2, max: 4, budget: 1000 },
  medium: { size: 7, min: 2, max: 5, budget: 2000 },
  hard: { size: 8, min: 2, max: 6, budget: 3000 },
};

const COMBOS = new Map();

function combos(length, sum) {
  const key = `${length}:${sum}`;
  const cached = COMBOS.get(key);
  if (cached) return cached;
  const found = [];
  function walk(start, left, total, mask) {
    if (left === 0) {
      if (total === 0) found.push(mask);
      return;
    }
    for (let digit = start; digit <= 9; digit += 1) {
      if (digit > total) break;
      walk(digit + 1, left - 1, total - digit, mask | (1 << digit));
    }
  }
  walk(1, length, sum, 0);
  COMBOS.set(key, found);
  return found;
}

function bits(mask) {
  const values = [];
  for (let digit = 1; digit <= 9; digit += 1) if (mask & (1 << digit)) values.push(digit);
  return values;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function runsOf(white) {
  const n = white.length;
  const runs = [];
  const across = Array.from({ length: n }, () => Array(n).fill(-1));
  const down = Array.from({ length: n }, () => Array(n).fill(-1));
  for (let r = 0; r < n; r += 1) {
    let c = 0;
    while (c < n) {
      if (!white[r][c]) {
        c += 1;
        continue;
      }
      const cells = [];
      while (c < n && white[r][c]) {
        cells.push([r, c]);
        c += 1;
      }
      const id = runs.length;
      cells.forEach(([rr, cc]) => { across[rr][cc] = id; });
      runs.push({ cells, dir: "right" });
    }
  }
  for (let c = 0; c < n; c += 1) {
    let r = 0;
    while (r < n) {
      if (!white[r][c]) {
        r += 1;
        continue;
      }
      const cells = [];
      while (r < n && white[r][c]) {
        cells.push([r, c]);
        r += 1;
      }
      const id = runs.length;
      cells.forEach(([rr, cc]) => { down[rr][cc] = id; });
      runs.push({ cells, dir: "down" });
    }
  }
  return { runs, across, down };
}

export function shapeProblems(white, minRun, maxRun) {
  const n = white.length;
  for (let i = 0; i < n; i += 1) {
    if (white[0][i] || white[i][0]) return "border";
  }
  const { runs } = runsOf(white);
  if (!runs.length) return "empty";
  for (const run of runs) {
    if (run.cells.length < minRun || run.cells.length > maxRun) return "length";
    const [r, c] = run.cells[0];
    if (run.dir === "right" && (c === 0 || white[r][c - 1])) return "clue";
    if (run.dir === "down" && (r === 0 || white[r - 1][c])) return "clue";
  }
  const seen = new Set();
  const stack = [];
  for (let r = 0; r < n && !stack.length; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (white[r][c]) {
        stack.push([r, c]);
        break;
      }
    }
  }
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const rr = r + dr;
      const cc = c + dc;
      if (rr >= 0 && cc >= 0 && rr < n && cc < n && white[rr][cc]) stack.push([rr, cc]);
    });
  }
  let total = 0;
  for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) if (white[r][c]) total += 1;
  if (seen.size !== total) return "split";
  const rows = white.slice(1).map((row) => row.join(""));
  if (new Set(rows).size < Math.min(3, n - 1)) return "repeat";
  return "";
}

function paintRow(n, minRun, maxRun, open, last) {
  const row = Array(n).fill(false);
  let c = 1;
  while (c < n) {
    if (last && open[c] === 0) {
      c += 1;
      continue;
    }
    if (open[c] >= maxRun) {
      c += 1;
      continue;
    }
    const must = open[c] > 0 && open[c] < minRun;
    if (!must && !last && Math.random() < (n >= 8 ? 0.5 : 0.28)) {
      c += 1;
      continue;
    }
    if (!must && last) {
      c += 1;
      continue;
    }
    let len = must ? 1 : minRun;
    while (c + len < n && open[c + len] > 0 && open[c + len] < minRun) len += 1;
    if (!must && Math.random() < 0.35) {
      const room = Math.min(maxRun, n - c);
      const extra = room - len;
      if (extra > 0) len += 1 + Math.floor(Math.random() * extra);
    }
    if (len < minRun || len > maxRun) return null;
    for (let k = 0; k < len; k += 1) {
      if (open[c + k] >= maxRun) return null;
      row[c + k] = true;
    }
    c += len + 1;
  }
  for (let col = 1; col < n; col += 1) {
    if (open[col] > 0 && open[col] < minRun && !row[col]) return null;
    if (last && row[col] && open[col] + 1 < minRun) return null;
  }
  let run = 0;
  for (let col = 1; col <= n; col += 1) {
    if (col < n && row[col]) run += 1;
    else if (run) {
      if (run < minRun || run > maxRun) return null;
      run = 0;
    }
  }
  return row;
}

function paintShape(n, minRun, maxRun) {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const white = Array.from({ length: n }, () => Array(n).fill(false));
    const open = Array(n).fill(0);
    let ok = true;
    for (let r = 1; r < n; r += 1) {
      const row = paintRow(n, minRun, maxRun, open, r === n - 1);
      if (!row || row.every((cell, col) => col === 0 || !cell)) {
        ok = false;
        break;
      }
      for (let c = 1; c < n; c += 1) {
        white[r][c] = row[c];
        open[c] = row[c] ? open[c] + 1 : 0;
      }
    }
    if (ok && !shapeProblems(white, minRun, maxRun)) return white;
  }
  return null;
}

function fillDigits(white, bias) {
  const { runs, across, down } = runsOf(white);
  const cells = [];
  white.forEach((row, r) => row.forEach((on, c) => {
    if (on) cells.push({ r, c, h: across[r][c], v: down[r][c] });
  }));
  const used = runs.map(() => 0);
  const value = Array(cells.length).fill(0);

  function candidates(index) {
    const cell = cells[index];
    let mask = (~used[cell.h]) & (~used[cell.v]) & 0x3fe;
    const hLeft = runs[cell.h].cells.length - bits(used[cell.h]).length - 1;
    const vLeft = runs[cell.v].cells.length - bits(used[cell.v]).length - 1;
    if (hLeft < 0 || vLeft < 0) return 0;
    return mask;
  }

  function search() {
    let best = -1;
    let bestCount = 99;
    for (let i = 0; i < cells.length; i += 1) {
      if (value[i]) continue;
      const count = bits(candidates(i)).length;
      if (count < bestCount) {
        best = i;
        bestCount = count;
        if (count <= 1) break;
      }
    }
    if (best < 0) return true;
    let order = bits(candidates(best));
    if (bias === "low") order = order.filter((digit) => digit <= 5).sort((a, b) => a - b);
    else if (bias === "high") order.sort((a, b) => b - a);
    else shuffle(order);
    if (!order.length) return false;
    for (const digit of order) {
      const cell = cells[best];
      value[best] = digit;
      used[cell.h] |= 1 << digit;
      used[cell.v] |= 1 << digit;
      if (search()) return true;
      used[cell.h] &= ~(1 << digit);
      used[cell.v] &= ~(1 << digit);
      value[best] = 0;
    }
    return false;
  }

  if (!search()) return null;
  const grid = white.map((row) => row.map(() => null));
  cells.forEach((cell, index) => { grid[cell.r][cell.c] = value[index]; });
  return grid;
}

let lastBoards = [];

export function countSolutions(grid, limit = 2, stepLimit = 8000) {
  lastBoards = [];
  const n = grid.length;
  const white = grid.map((row) => row.map((cell) => cell.type === "white"));
  const { runs, across, down } = runsOf(white);
  const cells = [];
  const given = [];
  grid.forEach((row, r) => row.forEach((cell, c) => {
    if (cell.type !== "white") return;
    const index = cells.length;
    cells.push({ r, c, h: across[r][c], v: down[r][c] });
    if (cell.given) given.push([index, cell.given]);
  }));
  runs.forEach((run) => {
    let sum = 0;
    const [sr, sc] = run.cells[0];
    const clue = run.dir === "right" ? grid[sr][sc - 1] : grid[sr - 1][sc];
    sum = run.dir === "right" ? clue.right : clue.down;
    run.sum = sum;
    run.masks = combos(run.cells.length, sum);
  });
  const used = runs.map(() => 0);
  const value = Array(cells.length).fill(0);
  given.forEach(([index, digit]) => {
    value[index] = digit;
    used[cells[index].h] |= 1 << digit;
    used[cells[index].v] |= 1 << digit;
  });
  let found = 0;
  let steps = 0;

  function allows(run, mask) {
    return run.masks.some((combo) => (combo & mask) === mask);
  }

  function candidates(index) {
    const cell = cells[index];
    let mask = (~used[cell.h]) & (~used[cell.v]) & 0x3fe;
    const next = [];
    bits(mask).forEach((digit) => {
      const bit = 1 << digit;
      if (allows(runs[cell.h], used[cell.h] | bit) && allows(runs[cell.v], used[cell.v] | bit)) next.push(digit);
    });
    return next;
  }

  function search() {
    steps += 1;
    if (found >= limit || steps > stepLimit) {
      if (steps > stepLimit) found = limit;
      return;
    }
    let best = -1;
    let bestList = null;
    for (let i = 0; i < cells.length; i += 1) {
      if (value[i]) continue;
      const list = candidates(i);
      if (best === -1 || list.length < bestList.length) {
        best = i;
        bestList = list;
        if (list.length <= 1) break;
      }
    }
    if (best < 0) {
      const snap = grid.map((row) => row.map(() => null));
      cells.forEach((cell, index) => { snap[cell.r][cell.c] = value[index]; });
      lastBoards.push(snap);
      found += 1;
      return;
    }
    for (const digit of bestList) {
      const cell = cells[best];
      value[best] = digit;
      used[cell.h] |= 1 << digit;
      used[cell.v] |= 1 << digit;
      search();
      used[cell.h] &= ~(1 << digit);
      used[cell.v] &= ~(1 << digit);
      value[best] = 0;
      if (found >= limit) return;
    }
  }

  search();
  return found;
}

function buildGrid(white, digits) {
  const n = white.length;
  const grid = white.map((row) => row.map(() => ({ type: "block" })));
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (white[r][c]) {
        grid[r][c] = { type: "white" };
        continue;
      }
      let right = 0;
      let down = 0;
      for (let cc = c + 1; cc < n && white[r][cc]; cc += 1) right += digits[r][cc];
      for (let rr = r + 1; rr < n && white[rr][c]; rr += 1) down += digits[rr][c];
      if (right || down) {
        const clue = { type: "clue" };
        if (right) clue.right = right;
        if (down) clue.down = down;
        grid[r][c] = clue;
      }
    }
  }
  const solution = digits.map((row) => row.map((value) => (value == null ? null : value)));
  return { grid, solution, size: n };
}

export function generate(difficulty = "easy") {
  const cfg = CONFIG[difficulty] || CONFIG.easy;
  const started = Date.now();
  while (Date.now() - started < cfg.budget) {
    const white = paintShape(cfg.size, cfg.min, cfg.size >= 8 ? Math.min(cfg.max, 4) : cfg.max);
    if (!white) continue;
    for (let fillTry = 0; fillTry < 20; fillTry += 1) {
      if (Date.now() - started > cfg.budget) break;
      const digits = fillDigits(white, fillTry === 0 ? "low" : fillTry === 1 ? "high" : "rand");
      if (!digits) continue;
      const built = buildGrid(white, digits);
      const count = countSolutions(built.grid, 2, 30000);
      if (count === 1) return built;
      if (count > 1 && lastBoards[1]) {
        const other = lastBoards[1];
        const spots = [];
        digits.forEach((row, r) => row.forEach((value, c) => {
          if (value != null && other[r][c] != null && other[r][c] !== value) spots.push([r, c]);
        }));
        shuffle(spots);
        const { runs, across, down } = runsOf(white);
        for (const [r, c] of spots.slice(0, 4)) {
          const used = new Set();
          runs[across[r][c]].cells.concat(runs[down[r][c]].cells).forEach(([rr, cc]) => {
            if (rr !== r || cc !== c) used.add(digits[rr][cc]);
          });
          for (let digit = 1; digit <= 9; digit += 1) {
            if (used.has(digit) || digit === digits[r][c]) continue;
            const previous = digits[r][c];
            digits[r][c] = digit;
            const next = buildGrid(white, digits);
            if (countSolutions(next.grid, 2, 8000) === 1) return next;
            digits[r][c] = previous;
            if (Date.now() - started > cfg.budget) break;
          }
        }
      }
      if (difficulty === "easy" && count > 1) {
        const spots = [];
        built.grid.forEach((row, r) => row.forEach((cell, c) => {
          if (cell.type === "white") spots.push([r, c]);
        }));
        shuffle(spots);
        for (const [r, c] of spots.slice(0, 8)) {
          built.grid[r][c] = { type: "white", given: digits[r][c] };
          if (countSolutions(built.grid, 2) === 1) return built;
          built.grid[r][c] = { type: "white" };
        }
      }
    }
  }
  throw new Error("Tek çözüm Çapraz Toplam üretilemedi");
}
