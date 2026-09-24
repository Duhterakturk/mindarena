// Mini Mantık. Desen yalnızca kayar. Döndürülmez, aynalanmaz.
// "#" öznenin yeridir. "X" öznenin olmadığı yerdir. "." kısıt değildir.
// "-" desende yoktur. "RC" belirli parça, "?T" herhangi bir üçgen, "R?" herhangi bir kırmızıdır.

export const SHAPES = ["circle", "square", "triangle"];
export const COLORS = ["red", "yellow", "blue"];

const COLOR_OF = { R: "red", B: "blue", Y: "yellow" };
const SHAPE_OF = { S: "square", T: "triangle", C: "circle" };
const CODE_COLOR = { red: "R", blue: "B", yellow: "Y" };
const CODE_SHAPE = { square: "S", triangle: "T", circle: "C" };
const PIECES = ["RS", "RT", "RC", "BS", "BT", "BC", "YS", "YT", "YC"];

export const PUZZLE_12 = {
  id: 12,
  clues: [
    { subject: "B?", pattern: [[".", "X", "."]] },
    { subject: "RT", pattern: [["X", ".", "X"], [".", "X", "."], ["X", ".", "X"]] },
    { subject: "Y?", pattern: [["Y?", "-"], ["-", "#"]] },
    { subject: "BT", pattern: [["#", "-"], ["-", "RT"]] },
    { subject: "YS", pattern: [["-", "?T"], ["-", "."], ["#", "-"]] },
    { subject: "?C", pattern: [["-", "#"], ["?C", "-"]] },
    { subject: "RS", pattern: [["?C"], ["X"], ["X"]] },
  ],
};

export function pieceCode(piece) {
  if (!piece) return null;
  if (typeof piece === "string") return piece;
  const color = CODE_COLOR[piece.color];
  const shape = CODE_SHAPE[piece.shape];
  if (!color || !shape) return null;
  return `${color}${shape}`;
}

export function pieceFromCode(code) {
  return { color: COLOR_OF[code[0]], shape: SHAPE_OF[code[1]] };
}

export function matches(piece, subject) {
  const code = pieceCode(piece);
  if (!code || !subject) return false;
  if (subject.startsWith("?")) return code[1] === subject[1];
  if (subject.endsWith("?")) return code[0] === subject[0];
  return code === subject;
}

function patternBox(pattern) {
  const height = pattern.length;
  const width = pattern.reduce((max, row) => Math.max(max, row.length), 0);
  const cells = [];
  for (let row = 0; row < height; row += 1) {
    const line = pattern[row] || [];
    for (let col = 0; col < line.length; col += 1) {
      if (line[col] !== "-") cells.push({ row, col, token: line[col] });
    }
  }
  return { height, width, cells };
}

function origins(box) {
  const list = [];
  for (let row = 0; row <= 3 - box.height; row += 1) {
    for (let col = 0; col <= 3 - box.width; col += 1) list.push({ row, col });
  }
  return list;
}

function at(board, origin, cell) {
  return board[origin.row + cell.row][origin.col + cell.col];
}

function isPositive(box) {
  return box.cells.some((cell) => cell.token === "#");
}

function positivePossible(board, subject, cells, origin) {
  return cells.every((cell) => {
    if (cell.token === "." || cell.token === "X") return true;
    const piece = at(board, origin, cell);
    if (!piece) return true;
    return matches(piece, cell.token === "#" ? subject : cell.token);
  });
}

function positiveWitness(board, subject, cells, origin) {
  return cells.every((cell) => {
    if (cell.token === "." || cell.token === "X") return true;
    const piece = at(board, origin, cell);
    return piece && matches(piece, cell.token === "#" ? subject : cell.token);
  });
}

function negativeBroken(board, subject, cells, origin) {
  const symbols = cells.filter((cell) => cell.token !== "." && cell.token !== "X" && cell.token !== "#");
  if (!symbols.every((cell) => matches(at(board, origin, cell), cell.token))) return false;
  return cells.some((cell) => cell.token === "X" && matches(at(board, origin, cell), subject));
}

function negativeSafe(board, subject, cells, origin) {
  const symbols = cells.filter((cell) => cell.token !== "." && cell.token !== "X" && cell.token !== "#");
  const contradicted = symbols.some((cell) => {
    const piece = at(board, origin, cell);
    return piece && !matches(piece, cell.token);
  });
  if (contradicted) return true;
  const crosses = cells.filter((cell) => cell.token === "X");
  return crosses.every((cell) => {
    const piece = at(board, origin, cell);
    return piece && !matches(piece, subject);
  });
}

export function clueStatus(board, clue) {
  const box = patternBox(clue.pattern);
  const spots = origins(box);
  const full = board.every((row) => row.every(Boolean));
  if (isPositive(box)) {
    if (spots.some((origin) => positiveWitness(board, clue.subject, box.cells, origin))) return "ok";
    if (!spots.some((origin) => positivePossible(board, clue.subject, box.cells, origin))) return "bad";
    return full ? "bad" : "open";
  }
  if (spots.some((origin) => negativeBroken(board, clue.subject, box.cells, origin))) return "bad";
  if (spots.every((origin) => negativeSafe(board, clue.subject, box.cells, origin))) return "ok";
  return full ? "bad" : "open";
}

export function isValid(board, clues) {
  return clues.every((clue) => clueStatus(board, clue) === "ok");
}

export function solve(clues) {
  const grid = [null, null, null].map(() => [null, null, null]);
  const found = [];

  function place(index, used) {
    if (found.length > 1) return;
    if (clues.some((clue) => clueStatus(grid, clue) === "bad")) return;
    if (index === 9) {
      if (isValid(grid, clues)) found.push(grid.map((row) => row.slice()));
      return;
    }
    const row = Math.floor(index / 3);
    const col = index % 3;
    for (const piece of PIECES) {
      if (used.has(piece)) continue;
      grid[row][col] = piece;
      used.add(piece);
      place(index + 1, used);
      used.delete(piece);
      grid[row][col] = null;
      if (found.length > 1) return;
    }
  }

  place(0, new Set());
  return found;
}

function rowsOf(codes) {
  return codes.map((row) => row.map(pieceFromCode));
}

export function generate() {
  const solutions = solve(PUZZLE_12.clues);
  if (solutions.length !== 1) throw new Error("Parça bulmacası üretilemedi");
  return { id: PUZZLE_12.id, clues: PUZZLE_12.clues, solution: rowsOf(solutions[0]) };
}
