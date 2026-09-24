// Renkli Şekiller: 3×3, 9 parça, boş hücre yok.
// Tikli kareler listedeki öğeleri birebir alır, sıra serbesttir.
// Çarpılı karelerde bu öğeler bulunmaz.
// ?S herhangi bir kare, ?C herhangi bir daire, B? o renkten herhangi bir parça.

export const PIECE_CODES = ["GS", "BS", "YS", "RS", "YC", "KC", "GC", "RC", "BC"];

const COLOR_OF = { G: "green", B: "blue", Y: "yellow", R: "red", K: "black" };
const SHAPE_OF = { S: "square", C: "circle" };
const CODE_COLOR = { green: "G", blue: "B", yellow: "Y", red: "R", black: "K" };
const CODE_SHAPE = { square: "S", circle: "C" };

export const QUESTION_3 = {
  clues: [
    { items: ["BC", "YC", "KC"], marks: [[".", "V", "."], ["V", ".", "."], [".", ".", "V"]] },
    { items: ["?C"], marks: [["V", ".", "."], [".", ".", "."], [".", ".", "."]] },
    { items: ["?S", "?S", "?S"], marks: [[".", ".", "V"], [".", "V", "."], [".", "V", "."]] },
    { items: ["B?", "B?"], marks: [[".", "V", "."], [".", ".", "."], ["V", ".", "."]] },
    { items: ["R?", "R?"], marks: [[".", ".", "."], [".", ".", "V"], [".", "V", "."]] },
    { items: ["Y?"], marks: [[".", ".", "X"], [".", ".", "X"], [".", ".", "X"]] },
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

export function matches(piece, item) {
  const code = pieceCode(piece);
  if (!code || !item) return false;
  if (item.startsWith("?")) return code[1] === item[1];
  if (item.endsWith("?")) return code[0] === item[0];
  return code === item;
}

function marked(marks, token) {
  const cells = [];
  marks.forEach((row, rowIndex) => {
    row.forEach((mark, colIndex) => {
      if (mark === token) cells.push([rowIndex, colIndex]);
    });
  });
  return cells;
}

function assigns(pieces, items) {
  if (pieces.length !== items.length) return false;
  const used = Array(items.length).fill(false);
  function take(index) {
    if (index === pieces.length) return true;
    for (let item = 0; item < items.length; item += 1) {
      if (used[item] || !matches(pieces[index], items[item])) continue;
      used[item] = true;
      if (take(index + 1)) return true;
      used[item] = false;
    }
    return false;
  }
  return take(0);
}

export function holds(grid, clue) {
  const checks = marked(clue.marks, "V");
  const crosses = marked(clue.marks, "X");
  if (checks.length) {
    const pieces = checks.map(([row, col]) => grid[row][col]);
    if (pieces.some((piece) => !piece)) return false;
    if (!assigns(pieces, clue.items)) return false;
  }
  return crosses.every(([row, col]) => {
    const piece = grid[row][col];
    return piece && clue.items.every((item) => !matches(piece, item));
  });
}

export function solve(clues) {
  const grid = [null, null, null].map(() => [null, null, null]);
  const found = [];

  function place(index, used) {
    if (found.length > 1) return;
    if (index === 9) {
      if (clues.every((clue) => holds(grid, clue))) found.push(grid.map((row) => row.slice()));
      return;
    }
    const row = Math.floor(index / 3);
    const col = index % 3;
    for (const code of PIECE_CODES) {
      if (used.has(code)) continue;
      grid[row][col] = code;
      used.add(code);
      place(index + 1, used);
      used.delete(code);
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
  const solutions = solve(QUESTION_3.clues);
  if (solutions.length !== 1) throw new Error("Renk bulmacası üretilemedi");
  return {
    pieces: PIECE_CODES.map(pieceFromCode),
    clues: QUESTION_3.clues,
    solution: rowsOf(solutions[0]),
  };
}
