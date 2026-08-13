// Kare Karalamaca: rastgele bir nonogram deseni. Her satır/sütun için koşu
// uzunlukları (ör. [1,2]) ipucu olarak hesaplanır. Zorluk, ızgara boyutuyla
// ölçeklenir.
const SIZE_BY_DIFFICULTY = { easy: 5, medium: 7, hard: 9 };

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
  const density = 0.45;
  let grid;
  do {
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() < density)
    );
  } while (grid.every((row) => row.every((v) => !v)));

  const solutionSet = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) solutionSet.push(`${r}-${c}`);
    }
  }

  const rowClues = grid.map((row) => runLengths(row));
  const colClues = Array.from({ length: cols }, (_, c) => runLengths(grid.map((row) => row[c])));

  return { solutionSet, rowClues, colClues, size: rows };
}
