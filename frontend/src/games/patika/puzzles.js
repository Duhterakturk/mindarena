// Patika: siyah kareler kapalıdır. Beyaz karelerden tek bir kapalı halka geçer.
// Halka her beyaz kareye bir kez girer, yalnız yatay ve dikey komşuya gider.

const SIZE = { easy: 8, medium: 9, hard: 10 };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function key(row, col) {
  return `${row}-${col}`;
}

function parse(cell) {
  const [row, col] = cell.split("-").map(Number);
  return [row, col];
}

export function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function neighbors(cell, size) {
  const [row, col] = parse(cell);
  const found = [];
  DIRS.forEach(([dr, dc]) => {
    const nextRow = row + dr;
    const nextCol = col + dc;
    if (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) found.push(key(nextRow, nextCol));
  });
  return found;
}

function adjacent(a, b) {
  const [ar, ac] = parse(a);
  const [br, bc] = parse(b);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

export function loopHolds(blacks, size, edges) {
  const blocked = new Set(blacks);
  const whites = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = key(row, col);
      if (!blocked.has(cell)) whites.push(cell);
    }
  }
  if (whites.length < 4) return false;
  const links = new Map(whites.map((cell) => [cell, []]));
  for (const edge of edges) {
    const [a, b] = edge.split("|");
    if (!links.has(a) || !links.has(b) || !adjacent(a, b)) return false;
    links.get(a).push(b);
    links.get(b).push(a);
  }
  if (whites.some((cell) => links.get(cell).length !== 2)) return false;
  const seen = new Set([whites[0]]);
  let cursor = links.get(whites[0])[0];
  let prev = whites[0];
  while (!seen.has(cursor)) {
    seen.add(cursor);
    const next = links.get(cursor).find((cell) => cell !== prev);
    prev = cursor;
    cursor = next;
  }
  return seen.size === whites.length && cursor === whites[0];
}

export function countLoops(blacks, size, limit = 2) {
  const blocked = new Set(blacks);
  const whites = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = key(row, col);
      if (!blocked.has(cell)) whites.push(cell);
    }
  }
  if (whites.length < 4) return 0;
  const adj = new Map(whites.map((cell) => [cell, neighbors(cell, size).filter((next) => !blocked.has(next))]));
  if (whites.some((cell) => adj.get(cell).length < 2)) return 0;
  const start = whites[0];
  const seen = new Set([start]);
  let count = 0;

  function walk(cell) {
    if (count >= limit) return;
    if (seen.size === whites.length) {
      if (adj.get(cell).includes(start)) count += 1;
      return;
    }
    for (const next of adj.get(cell)) {
      if (seen.has(next)) continue;
      const open = adj.get(next).some((item) => !seen.has(item) || (seen.size + 1 === whites.length && item === start));
      if (!open && seen.size + 1 !== whites.length) continue;
      seen.add(next);
      walk(next);
      seen.delete(next);
      if (count >= limit) return;
    }
  }

  walk(start);
  return Math.floor(count / 2);
}

function randomLoop(size, random) {
  const minimum = size * 2;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const start = key(Math.floor(random() * size), Math.floor(random() * size));
    const path = [start];
    const seen = new Set([start]);
    let guard = 0;
    while (guard < size * size * 6) {
      guard += 1;
      const end = path[path.length - 1];
      const options = neighbors(end, size).filter((cell) => {
        if (seen.has(cell)) return false;
        const touched = neighbors(cell, size).filter((item) => seen.has(item));
        return touched.every((item) => item === end || item === start) && touched.includes(end);
      });
      const canClose = path.length >= minimum && adjacent(end, start);
      if (canClose && (options.length === 0 || random() < 0.2)) return path;
      if (!options.length) break;
      const next = options[Math.floor(random() * options.length)];
      path.push(next);
      seen.add(next);
    }
  }
  return null;
}

export function generate(difficulty = "easy", random = Math.random) {
  const size = SIZE[difficulty] || SIZE.easy;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const loop = randomLoop(size, random);
    if (!loop) continue;
    const white = new Set(loop);
    const blacks = [];
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const cell = key(row, col);
        if (!white.has(cell)) blacks.push(cell);
      }
    }
    if (countLoops(blacks, size, 2) !== 1) continue;
    const edges = loop.map((cell, index) => edgeKey(cell, loop[(index + 1) % loop.length]));
    return { rows: size, cols: size, blacks, edges };
  }
  throw new Error("Patika halkası üretilemedi");
}
