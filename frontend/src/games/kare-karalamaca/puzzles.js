import { countNonogram } from "../common/solvers";

// Kare Karalamaca: rastgele bir desen. Yalnızca tek çözümlü ipucu seti döner.
const SIZE_BY_DIFFICULTY = { easy: 5, medium: 6, hard: 7 };

function runLengths(bits) {
  const runs = [];
  let count = 0;
  for (const b of bits) {
    if (b) {
      count++;
    } else if (count > 0) {
      runs.push(count);
      count = 0;
    }
  }
  if (count > 0) runs.push(count);
  return runs.length ? runs : [0];
}

export function generate(difficulty = "easy") {
  const rows = SIZE_BY_DIFFICULTY[difficulty] || 5;
  const cols = rows;
  for (let attempt = 0; attempt < 30; attempt++) {
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() < 0.45)
    );
    if (grid.every((row) => row.every((value) => !value))) continue;
    const rowClues = grid.map((row) => runLengths(row));
    const colClues = Array.from({ length: cols }, (_, c) => runLengths(grid.map((row) => row[c])));
    if (countNonogram(rowClues, colClues) !== 1) continue;
    const solutionSet = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) if (grid[r][c]) solutionSet.push(`${r}-${c}`);
    }
    return { solutionSet, rowClues, colClues, size: rows };
  }
  throw new Error("Tek çözüm Kare Karalamaca üretilemedi");
}
