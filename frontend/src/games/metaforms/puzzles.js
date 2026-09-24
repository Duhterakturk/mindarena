// 3×3 tahta, 9 parça (3 şekil × 3 renk). Her parça bir kez kullanılır.
// Evet: parça taralı karelerden birindedir. Tek kareyse oraya yerleşir.
// Hayır: parça işaretli karelerin hiçbirinde değildir.
// Yalnızca şekil veya yalnızca renk, o türden üç parçanın tümü içindir.

export const SHAPES = ["circle", "square", "triangle"];
export const COLORS = ["red", "yellow", "blue"];

const CELL_KEYS = ["0-0", "0-1", "0-2", "1-0", "1-1", "1-2", "2-0", "2-1", "2-2"];
const MIN_CLUES = { easy: 9, medium: 7, hard: 6 };
const PROTECT_EXACT = { easy: 3, medium: 1, hard: 0 };
const MIN_NO = { easy: 3, medium: 2, hard: 2 };
const ORDER = {
  easy: ["exact", "row", "col", "pair", "neg", "shape-row", "color-col", "shape-no", "color-no"],
  medium: ["row", "col", "pair", "neg", "shape-row", "color-col", "exact", "shape-no", "color-no"],
  hard: ["shape-no", "color-no", "shape-row", "color-col", "neg", "pair", "row", "col", "exact"],
};
const NODE_CAP = 80_000;

function shuffle(list, random) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function cellKey(index) {
  return CELL_KEYS[index];
}

function cellIndex(key) {
  const index = CELL_KEYS.indexOf(key);
  return index;
}

function pieceIndex(shape, color) {
  return SHAPES.indexOf(shape) * 3 + COLORS.indexOf(color);
}

function pieceAt(index) {
  return { shape: SHAPES[Math.floor(index / 3)], color: COLORS[index % 3] };
}

function bitCount(value) {
  let count = 0;
  let bits = value;
  while (bits) {
    bits &= bits - 1;
    count += 1;
  }
  return count;
}

function lowBit(bits) {
  return 31 - Math.clz32(bits & -bits);
}

export function satisfies(grid, clues) {
  return clues.every((clue) => clueHolds(grid, clue));
}

function clueHolds(grid, clue) {
  const region = new Set(clue.cells);
  let inside = 0;
  let matched = 0;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const piece = grid[row][col];
      if (!piece || !describes(piece, clue)) continue;
      matched += 1;
      if (region.has(`${row}-${col}`)) inside += 1;
    }
  }
  const specific = Boolean(clue.shape && clue.color);
  if (specific) return clue.sign === "yes" ? inside === 1 : inside === 0;
  if (matched !== 3) return false;
  return clue.sign === "yes" ? inside >= 1 : inside === 0;
}

function describes(piece, clue) {
  if (clue.shape && piece.shape !== clue.shape) return false;
  if (clue.color && piece.color !== clue.color) return false;
  return Boolean(clue.shape || clue.color);
}

function prepared(clues) {
  const pieceCells = Array(9).fill(0x1ff);
  const groups = [];
  for (const clue of clues) {
    const region = [];
    for (const key of clue.cells || []) {
      const index = cellIndex(key);
      if (index >= 0) region.push(index);
    }
    if (!region.length || (!clue.shape && !clue.color)) return null;
    if (clue.shape && clue.color) {
      const piece = pieceIndex(clue.shape, clue.color);
      if (piece < 0) return null;
      let mask = 0;
      region.forEach((cell) => {
        mask |= 1 << cell;
      });
      if (clue.sign === "yes") pieceCells[piece] &= mask;
      else pieceCells[piece] &= (~mask) & 0x1ff;
    } else {
      groups.push({
        shape: clue.shape ? SHAPES.indexOf(clue.shape) : null,
        color: clue.color ? COLORS.indexOf(clue.color) : null,
        region: new Set(region),
        yes: clue.sign === "yes",
      });
    }
  }
  if (pieceCells.some((mask) => mask === 0)) return { impossible: true };
  return { pieceCells, groups };
}

function groupsHold(grid, groups, finished) {
  for (const clue of groups) {
    let inside = 0;
    let matched = 0;
    for (let cell = 0; cell < 9; cell += 1) {
      const piece = grid[cell];
      if (piece < 0) continue;
      const shape = Math.floor(piece / 3);
      const color = piece % 3;
      if (clue.shape !== null && clue.shape !== shape) continue;
      if (clue.color !== null && clue.color !== color) continue;
      matched += 1;
      if (clue.region.has(cell)) inside += 1;
    }
    if (!clue.yes && inside > 0) return false;
    if (clue.yes && matched === 3 && inside === 0) return false;
    if (finished && matched !== 3) return false;
    if (finished && clue.yes && inside < 1) return false;
  }
  return true;
}

export function countSolutions(clues, limit = 2) {
  const setup = prepared(clues);
  if (!setup) return 0;
  if (setup.impossible) return 0;
  const { pieceCells, groups } = setup;
  const forced = Array(9).fill(-1);
  let pinned = 0;
  for (let piece = 0; piece < 9; piece += 1) {
    if (bitCount(pieceCells[piece]) !== 1) continue;
    const cell = lowBit(pieceCells[piece]);
    if (forced[cell] !== -1) return 0;
    forced[cell] = piece;
    pinned += 1;
  }
  if (pinned === 9) return groupsHold(forced, groups, true) ? 1 : 0;

  const cellPieces = Array(9).fill(0x1ff);
  for (let piece = 0; piece < 9; piece += 1) {
    for (let cell = 0; cell < 9; cell += 1) {
      if ((pieceCells[piece] & (1 << cell)) === 0) cellPieces[cell] &= ~(1 << piece);
    }
  }

  const grid = forced.slice();
  let count = 0;
  let nodes = 0;

  function place(used) {
    nodes += 1;
    if (nodes > NODE_CAP) {
      count = limit;
      return;
    }
    if (count >= limit) return;
    let next = -1;
    let best = 10;
    let choices = 0;
    for (let cell = 0; cell < 9; cell += 1) {
      if (grid[cell] >= 0) continue;
      const bits = cellPieces[cell] & ~used;
      const size = bitCount(bits);
      if (size === 0) return;
      if (size < best) {
        best = size;
        next = cell;
        choices = bits;
      }
    }
    if (next < 0) {
      if (groupsHold(grid, groups, true)) count += 1;
      return;
    }
    if (!groupsHold(grid, groups, false)) return;
    let bits = choices;
    while (bits) {
      const bit = bits & -bits;
      bits ^= bit;
      const piece = lowBit(bit);
      if ((pieceCells[piece] & (1 << next)) === 0) continue;
      grid[next] = piece;
      place(used | bit);
      grid[next] = -1;
      if (count >= limit) return;
    }
  }

  let used = 0;
  for (let cell = 0; cell < 9; cell += 1) {
    if (grid[cell] >= 0) used |= 1 << grid[cell];
  }
  place(used);
  return count;
}

function rowsOf(ids) {
  return [0, 1, 2].map((row) => [0, 1, 2].map((col) => pieceAt(ids[row * 3 + col])));
}

function cluePool(ids, random) {
  const clues = [];
  const seen = new Set();
  function add(clue) {
    const signature = `${clue.kind}|${clue.sign}|${clue.shape}|${clue.color}|${clue.cells.join(",")}`;
    if (seen.has(signature)) return;
    seen.add(signature);
    clues.push(clue);
  }

  ids.forEach((piece, index) => {
    const { shape, color } = pieceAt(piece);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const rowCells = [0, 1, 2].map((offset) => cellKey(row * 3 + offset));
    const colCells = [0, 1, 2].map((offset) => cellKey(offset * 3 + col));
    add({ kind: "exact", sign: "yes", shape, color, cells: [cellKey(index)] });
    add({ kind: "row", sign: "yes", shape, color, cells: rowCells });
    add({ kind: "col", sign: "yes", shape, color, cells: colCells });
    const neighbor = col === 2 ? index - 1 : index + 1;
    add({
      kind: "pair",
      sign: "yes",
      shape,
      color,
      cells: [cellKey(index), cellKey(neighbor)].sort(),
    });
    const away = shuffle(
      ids.map((_, cell) => cell).filter((cell) => cell !== index),
      random,
    ).slice(0, 2);
    away.forEach((cell) => {
      add({ kind: "neg", sign: "no", shape, color, cells: [cellKey(cell)] });
    });
    add({ kind: "shape-row", sign: "yes", shape, color: null, cells: rowCells });
    add({ kind: "color-col", sign: "yes", shape: null, color, cells: colCells });
  });

  for (let shapeIndex = 0; shapeIndex < 3; shapeIndex += 1) {
    for (let row = 0; row < 3; row += 1) {
      const cells = [0, 1, 2].map((col) => row * 3 + col);
      if (cells.every((cell) => Math.floor(ids[cell] / 3) !== shapeIndex)) {
        add({ kind: "shape-no", sign: "no", shape: SHAPES[shapeIndex], color: null, cells: cells.map(cellKey) });
      }
    }
  }
  for (let colorIndex = 0; colorIndex < 3; colorIndex += 1) {
    for (let col = 0; col < 3; col += 1) {
      const cells = [0, 1, 2].map((row) => row * 3 + col);
      if (cells.every((cell) => ids[cell] % 3 !== colorIndex)) {
        add({ kind: "color-no", sign: "no", shape: null, color: COLORS[colorIndex], cells: cells.map(cellKey) });
      }
    }
  }
  return clues;
}

function publish(clue) {
  return { sign: clue.sign, shape: clue.shape, color: clue.color, cells: clue.cells };
}

function without(list, clue) {
  return list.filter((item) => item !== clue);
}

function stillUnique(clues) {
  return countSolutions(clues.map(publish), 2) === 1;
}

function countKind(list, kind) {
  return list.filter((clue) => clue.kind === kind).length;
}

function countSign(list, sign) {
  return list.filter((clue) => clue.sign === sign).length;
}

export function generate(difficulty = "easy", random = Math.random) {
  const minClues = MIN_CLUES[difficulty] || MIN_CLUES.easy;
  const protect = PROTECT_EXACT[difficulty] ?? PROTECT_EXACT.easy;
  const minNo = MIN_NO[difficulty] ?? MIN_NO.easy;
  const rank = Object.fromEntries((ORDER[difficulty] || ORDER.easy).map((kind, index) => [kind, index]));

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const ids = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], random);
    const pool = cluePool(ids, random);
    const exact = shuffle(pool.filter((clue) => clue.kind === "exact"), random);
    const weaker = pool.filter((clue) => clue.kind !== "exact");
    let chosen = [...exact, ...weaker];
    if (!stillUnique(chosen)) continue;

    for (const clue of exact.slice(protect)) {
      const next = without(chosen, clue);
      if (stillUnique(next)) chosen = next;
    }

    const drop = weaker.slice().sort((a, b) => rank[b.kind] - rank[a.kind]);
    for (const clue of drop) {
      if (chosen.length <= minClues) break;
      if (clue.sign === "no" && countSign(chosen, "no") <= minNo) continue;
      const next = without(chosen, clue);
      if (stillUnique(next)) chosen = next;
    }

    if (countKind(chosen, "exact") < protect) continue;
    if (countSign(chosen, "no") < minNo) continue;
    if (!stillUnique(chosen)) continue;
    const ordered = chosen.slice().sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9));
    return { clues: ordered.map(publish), solution: rowsOf(ids) };
  }
  throw new Error("Parça bulmacası üretilemedi");
}
