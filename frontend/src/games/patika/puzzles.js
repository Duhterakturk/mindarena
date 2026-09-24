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

function solveLoops(blacks, size, limit = 2) {
  const blocked = new Set(blacks);
  const whites = [];
  let even = 0;
  let odd = 0;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (blocked.has(key(row, col))) continue;
      whites.push(key(row, col));
      if ((row + col) % 2 === 0) even += 1;
      else odd += 1;
    }
  }
  if (whites.length < 4 || even !== odd) return { solutions: [], done: true };
  const at = new Map(whites.map((cell, index) => [cell, index]));
  const count = whites.length;
  const adj = whites.map((cell) => neighbors(cell, size).filter((next) => at.has(next)).map((next) => at.get(next)));
  if (adj.some((list) => list.length < 2)) return { solutions: [], done: true };

  const edgeA = [];
  const edgeB = [];
  for (let a = 0; a < count; a += 1) {
    adj[a].forEach((b) => {
      if (a < b) {
        edgeA.push(a);
        edgeB.push(b);
      }
    });
  }
  const edges = edgeA.length;
  const incident = Array.from({ length: count }, () => []);
  for (let edge = 0; edge < edges; edge += 1) {
    incident[edgeA[edge]].push(edge);
    incident[edgeB[edge]].push(edge);
  }

  const status = new Uint8Array(edges);
  const degree = new Uint8Array(count);
  const partner = new Int16Array(count);
  for (let cell = 0; cell < count; cell += 1) partner[cell] = cell;
  const undo = [];
  const solutions = [];
  let nodes = 0;
  let exhausted = false;
  const nodeCap = 25000;

  function isFull(a, b) {
    for (let cell = 0; cell < count; cell += 1) {
      const need = cell === a || cell === b ? 1 : 2;
      if (degree[cell] !== need) return false;
    }
    return true;
  }

  function rollback(mark) {
    while (undo.length > mark) {
      const step = undo.pop();
      status[step.edge] = 0;
      if (step.out) continue;
      degree[step.a] = step.degreeA;
      degree[step.b] = step.degreeB;
      partner[step.endA] = step.partnerA;
      partner[step.endB] = step.partnerB;
    }
  }

  function setOut(edge) {
    if (status[edge] === 2) return true;
    if (status[edge] === 1) return false;
    undo.push({ edge, out: true });
    status[edge] = 2;
    return true;
  }

  function setIn(edge) {
    if (status[edge] === 1) return true;
    if (status[edge] === 2) return false;
    const a = edgeA[edge];
    const b = edgeB[edge];
    if (degree[a] >= 2 || degree[b] >= 2) return false;
    const endA = degree[a] === 0 ? a : partner[a];
    const endB = degree[b] === 0 ? b : partner[b];
    const closing = degree[a] === 1 && degree[b] === 1 && endA === b;
    if (closing && !isFull(a, b)) return false;
    undo.push({
      edge,
      out: false,
      a,
      b,
      endA,
      endB,
      degreeA: degree[a],
      degreeB: degree[b],
      partnerA: partner[endA],
      partnerB: partner[endB],
    });
    status[edge] = 1;
    degree[a] += 1;
    degree[b] += 1;
    if (!closing) {
      partner[endA] = endB;
      partner[endB] = endA;
    }
    return true;
  }

  function closesShort(edge) {
    const a = edgeA[edge];
    const b = edgeB[edge];
    if (degree[a] !== 1 || degree[b] !== 1) return false;
    return partner[a] === b && !isFull(a, b);
  }

  function propagate() {
    let changed = true;
    while (changed) {
      changed = false;
      for (let edge = 0; edge < edges; edge += 1) {
        if (status[edge] === 0 && closesShort(edge) && setOut(edge)) changed = true;
      }
      for (let cell = 0; cell < count; cell += 1) {
        const unknown = incident[cell].filter((edge) => status[edge] === 0);
        if (degree[cell] > 2 || degree[cell] + unknown.length < 2) return false;
        if (degree[cell] === 2) {
          for (const edge of unknown) {
            if (!setOut(edge)) return false;
            changed = true;
          }
        } else if (degree[cell] + unknown.length === 2) {
          for (const edge of unknown) {
            if (status[edge] !== 0) continue;
            if (!setIn(edge)) return false;
            changed = true;
          }
        }
      }
    }
    return true;
  }

  function linked() {
    let alive = 0;
    const seen = new Uint8Array(count);
    let start = -1;
    for (let cell = 0; cell < count; cell += 1) {
      if (degree[cell] < 2) {
        alive += 1;
        if (start < 0) start = cell;
      }
    }
    if (alive === 0) return true;
    const queue = [start];
    seen[start] = 1;
    let reached = 1;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const cell = queue[cursor];
      if (degree[cell] === 1) {
        const other = partner[cell];
        if (degree[other] < 2 && !seen[other]) {
          seen[other] = 1;
          queue.push(other);
          reached += 1;
        }
      }
      incident[cell].forEach((edge) => {
        if (status[edge] !== 0) return;
        const other = edgeA[edge] === cell ? edgeB[edge] : edgeA[edge];
        if (degree[other] >= 2 || seen[other]) return;
        seen[other] = 1;
        queue.push(other);
        reached += 1;
      });
    }
    return reached === alive;
  }

  function finished() {
    for (let cell = 0; cell < count; cell += 1) if (degree[cell] !== 2) return false;
    return true;
  }

  function collect() {
    const loop = [];
    for (let edge = 0; edge < edges; edge += 1) {
      if (status[edge] === 1) loop.push(edgeKey(whites[edgeA[edge]], whites[edgeB[edge]]));
    }
    return loop;
  }

  function choose() {
    let bestScore = 99;
    let best = -1;
    for (let cell = 0; cell < count; cell += 1) {
      if (degree[cell] >= 2) continue;
      const unknown = incident[cell].filter((edge) => status[edge] === 0);
      if (!unknown.length) continue;
      const score = unknown.length + (degree[cell] === 1 ? 0 : 2);
      if (score < bestScore) {
        bestScore = score;
        best = unknown[0];
      }
    }
    return best;
  }

  function search() {
    if (solutions.length >= limit || exhausted) return;
    nodes += 1;
    if (nodes > nodeCap) {
      exhausted = true;
      return;
    }
    const mark = undo.length;
    if (!propagate()) {
      rollback(mark);
      return;
    }
    if (finished()) {
      solutions.push(collect());
      rollback(mark);
      return;
    }
    if (!linked()) {
      rollback(mark);
      return;
    }
    const edge = choose();
    if (edge < 0) {
      rollback(mark);
      return;
    }
    const mid = undo.length;
    if (setIn(edge)) search();
    rollback(mid);
    if (solutions.length < limit && !exhausted && setOut(edge)) search();
    rollback(mark);
  }

  search();
  return { solutions, done: !exhausted };
}

export function countLoops(blacks, size, limit = 2) {
  return solveLoops(blacks, size, limit).solutions.length;
}

const RATIO = { easy: 0.25, medium: 0.2, hard: 0.15 };

function shuffle(list, random) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function colorOf(cell) {
  const [row, col] = parse(cell);
  return (row + col) % 2;
}

function targetBlacks(size, ratio) {
  const cells = size * size;
  let even = 0;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) if ((row + col) % 2 === 0) even += 1;
  }
  const diff = even - (cells - even);
  let count = Math.round(cells * ratio);
  const min = Math.ceil(cells * 0.12);
  const max = Math.floor(cells * 0.28);
  if (count < min) count = min;
  if (count > max) count = max;
  while ((count + diff) % 2 !== 0) count += 1;
  if (count > max) count -= 2;
  return count;
}

function openDegree(cell, blocked, size) {
  return neighbors(cell, size).filter((next) => !blocked.has(next)).length;
}

function canBlock(cell, blocked, size) {
  if (blocked.has(cell)) return false;
  const [row, col] = parse(cell);
  if (row < 0 || row >= size || col < 0 || col >= size) return false;
  blocked.add(cell);
  const harmed = [cell, ...neighbors(cell, size)].some((item) => {
    const [ir, ic] = parse(item);
    if (ir < 0 || ir >= size || ic < 0 || ic >= size || blocked.has(item)) return false;
    return openDegree(item, blocked, size) < 2;
  });
  blocked.delete(cell);
  return !harmed;
}

function tightRatio(blacks, size) {
  const blocked = new Set(blacks);
  let whites = 0;
  let tight = 0;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = key(row, col);
      if (blocked.has(cell)) continue;
      whites += 1;
      const open = neighbors(cell, size).filter((next) => !blocked.has(next)).length;
      if (open === 2) tight += 1;
    }
  }
  return whites ? tight / whites : 1;
}

function differCells(first, second) {
  const other = new Set(second);
  const cells = new Set();
  first.forEach((edge) => {
    if (other.has(edge)) return;
    edge.split("|").forEach((cell) => cells.add(cell));
  });
  second.forEach((edge) => {
    if (first.includes(edge)) return;
    edge.split("|").forEach((cell) => cells.add(cell));
  });
  return [...cells];
}

function sampleBlacks(size, count, random) {
  const all = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) all.push(key(row, col));
  }
  const blocked = new Set();
  shuffle(all, random).forEach((cell) => {
    if (blocked.size >= count || !canBlock(cell, blocked, size)) return;
    const colorCount = [0, 0];
    blocked.forEach((item) => { colorCount[colorOf(item)] += 1; });
    if (colorCount[colorOf(cell)] > colorCount[1 - colorOf(cell)]) return;
    blocked.add(cell);
  });
  return blocked.size >= Math.ceil(size * size * 0.12) && blocked.size % 2 === (size % 2 === 0 ? 0 : 1) ? [...blocked] : null;
}

export function generate(difficulty = "easy", random = Math.random) {
  const size = SIZE[difficulty] || SIZE.easy;
  const goal = targetBlacks(size, RATIO[difficulty] || RATIO.easy);
  const started = Date.now();
  for (let attempt = 0; attempt < 5000 && Date.now() - started < 2800; attempt += 1) {
    let blacks = sampleBlacks(size, Math.max(4, goal - 4), random);
    if (!blacks || tightRatio(blacks, size) > 0.4) continue;
    let found = solveLoops(blacks, size, 2);
    let narrow = 0;
    while (found.solutions.length > 1 && narrow < 5 && blacks.length + 2 <= Math.floor(size * size * 0.28)) {
      narrow += 1;
      const spots = shuffle(differCells(found.solutions[0], found.solutions[1]), random);
      let chosen = null;
      for (let index = 0; index < Math.min(spots.length, 8) && !chosen; index += 1) {
        const extra = spots[index];
        const blocked = new Set(blacks);
        if (!canBlock(extra, blocked, size)) continue;
        const mate = spots.find((cell) => cell !== extra && colorOf(cell) !== colorOf(extra) && canBlock(cell, new Set([...blocked, extra]), size));
        if (!mate) continue;
        const candidate = blacks.concat([extra, mate]);
        if (tightRatio(candidate, size) > 0.4) continue;
        const trial = solveLoops(candidate, size, 2);
        if (trial.solutions.length === 1 || (trial.solutions.length > 1 && narrow < 4)) {
          chosen = candidate;
          found = trial;
          if (trial.solutions.length === 1) break;
        }
      }
      if (!chosen) break;
      blacks = chosen;
    }
    const ratio = blacks.length / (size * size);
    if (found.done && found.solutions.length === 1 && ratio >= 0.12 && ratio <= 0.28 && tightRatio(blacks, size) <= 0.4) {
      return { rows: size, cols: size, blacks, edges: found.solutions[0] };
    }
  }
  throw new Error("Patika halkası üretilemedi");
}
