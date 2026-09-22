import { shuffle, generateLatinSquare, carvePuzzle } from "../common/latinSquare";
import { countLatin } from "../common/solvers";

// Futoshiki: ızgara boyutu, ipucu (eşitsizlik işareti) sayısı ve verilen
// hücre sayısı zorlukla ölçeklenir. Daha büyük ızgara + daha az ipucu/verilen
// hücre = daha zor.
const CONFIG = {
  easy: { size: 4, givens: 6, hints: 6 },
  medium: { size: 5, givens: 6, hints: 5 },
  hard: { size: 6, givens: 5, hints: 4 },
};

function randomHintPositions(n, count) {
  const allHorizontal = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n - 1; c++) allHorizontal.push({ r, c, type: "h" });
  }
  const allVertical = [];
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n; c++) allVertical.push({ r, c, type: "v" });
  }
  const all = shuffle([...allHorizontal, ...allVertical]).slice(0, count);
  return {
    horizontal: all.filter((p) => p.type === "h"),
    vertical: all.filter((p) => p.type === "v"),
  };
}

function signsFrom(solution, horizontal, vertical) {
  return {
    horizontal: horizontal.map(({ r, c }) => ({
      r,
      c,
      sign: solution[r][c] < solution[r][c + 1] ? "<" : ">",
    })),
    vertical: vertical.map(({ r, c }) => ({
      r,
      c,
      sign: solution[r][c] > solution[r + 1][c] ? "v" : "^",
    })),
  };
}

function respectsSigns(grid, horizontal, vertical) {
  return (
    horizontal.every(({ r, c, sign }) => (sign === "<" ? grid[r][c] < grid[r][c + 1] : grid[r][c] > grid[r][c + 1])) &&
    vertical.every(({ r, c, sign }) => (sign === "v" ? grid[r][c] > grid[r + 1][c] : grid[r][c] < grid[r + 1][c]))
  );
}

export function generate(difficulty = "easy") {
  const { size, givens, hints } = CONFIG[difficulty] || CONFIG.easy;
  for (let attempt = 0; attempt < 40; attempt++) {
    const solution = generateLatinSquare(size);
    const puzzle = carvePuzzle(solution, givens);
    const positions = randomHintPositions(size, hints);
    const signed = signsFrom(solution, positions.horizontal, positions.vertical);
    if (countLatin(puzzle, 2, (grid) => respectsSigns(grid, signed.horizontal, signed.vertical)) === 1) {
      return { puzzle, solution, ...positions, ...signed, size };
    }
  }
  throw new Error("Tek çözüm Büyük Küçük üretilemedi");
}
