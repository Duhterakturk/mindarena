// Colours: paletteki parçalar 4×4 kareye birer kez konur, kalan kareler boş kalır.
// Tik dolu, çarpı boş, eğik çizgi de o görüntünün olmadığını söyler.

export const SHAPES = ["circle", "square", "triangle"];
export const COLORS = ["red", "yellow", "blue", "green", "black"];

const PIECES = { easy: 4, medium: 6, hard: 6 };

function shuffle(list, random) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function same(piece, shape, color) {
  return Boolean(piece && piece.shape === shape && (!color || piece.color === color));
}

export function clueHolds(grid, clue) {
  const matched = clue.cells.every((cell) => {
    const piece = grid[cell.row][cell.col];
    if (cell.mark === "empty") return !piece;
    if (cell.mark === "filled" || cell.mark === "unknown") return Boolean(piece);
    if (cell.mark === "piece") return same(piece, cell.shape, cell.color);
    return false;
  });
  return clue.sign === "yes" ? matched : !matched;
}

function occupied(grid) {
  const spots = [];
  grid.forEach((row, r) => row.forEach((piece, c) => {
    if (piece) spots.push([r, c, piece]);
  }));
  return spots;
}

function solutions(pieces, clues, limit = 2) {
  const grid = Array.from({ length: 4 }, () => Array(4).fill(null));
  let count = 0;
  let nodes = 0;

  function place(index, used) {
    nodes += 1;
    if (nodes > 80_000) {
      count = limit;
      return;
    }
    if (count >= limit) return;
    if (index === pieces.length) {
      if (clues.every((clue) => clueHolds(grid, clue))) count += 1;
      return;
    }
    for (let cell = 0; cell < 16; cell += 1) {
      if (used[cell]) continue;
      const row = Math.floor(cell / 4);
      const col = cell % 4;
      grid[row][col] = pieces[index];
      used[cell] = true;
      const broken = clues.some((clue) => clue.sign === "yes" && clue.cells.some((item) => {
        const piece = grid[item.row][item.col];
        if (!piece && item.mark !== "empty") return false;
        if (item.mark === "empty" && piece) return true;
        if (item.mark === "piece" && piece && !same(piece, item.shape, item.color)) return true;
        return false;
      }));
      if (!broken) place(index + 1, used);
      grid[row][col] = null;
      used[cell] = false;
      if (count >= limit) return;
    }
  }

  place(0, Array(16).fill(false));
  return count;
}

export function generate(difficulty = "easy", random = Math.random) {
  const count = PIECES[difficulty] || 4;
  const catalog = [];
  SHAPES.forEach((shape) => COLORS.forEach((color) => catalog.push({ shape, color })));
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const pieces = shuffle(catalog, random).slice(0, count);
    const spots = shuffle([0, 1, 2, 3].flatMap((row) => [0, 1, 2, 3].map((col) => [row, col])), random);
    const solution = Array.from({ length: 4 }, () => Array(4).fill(null));
    pieces.forEach((piece, index) => {
      const [row, col] = spots[index];
      solution[row][col] = piece;
    });
    const filled = occupied(solution);
    const empty = spots.slice(count);
    const exact = filled.map(([row, col, piece]) => ({
      sign: "yes",
      cells: [{ row, col, mark: "piece", shape: piece.shape, color: piece.color }],
    }));
    let clues = [
      ...exact,
      { sign: "yes", cells: filled.map(([row, col]) => ({ row, col, mark: indexMark(random) })) },
      { sign: "yes", cells: empty.slice(0, 4).map(([row, col]) => ({ row, col, mark: "empty" })) },
      {
        sign: "no",
        cells: [{
          row: empty[0][0],
          col: empty[0][1],
          mark: "piece",
          shape: filled[0][2].shape,
          color: filled[0][2].color,
        }],
      },
    ];
    const hide = difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;
    let hidden = 0;
    for (const clue of exact) {
      if (hidden >= hide) break;
      const next = clues.filter((item) => item !== clue);
      if (solutions(pieces, next, 2) === 1) {
        clues = next;
        hidden += 1;
      }
    }
    if (solutions(pieces, clues, 2) !== 1) continue;
    return { pieces, clues, solution };
  }
  throw new Error("Renk bulmacası üretilemedi");
}

function indexMark(random) {
  return random() < 0.5 ? "filled" : "unknown";
}
