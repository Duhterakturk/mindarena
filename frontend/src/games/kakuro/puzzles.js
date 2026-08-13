import { shuffle, generateLatinSquare } from "../common/latinSquare";

const GRID_SIZE_BY_DIFFICULTY = { easy: 4, medium: 6, hard: 8 };

// Kakuro ızgara şekli: NxN iç alan, her tam satır ve tam sütun tek bir koşu
// (run) oluşturur. Zorluk, N (dolayısıyla koşu uzunluğu) ile ölçeklenir.
export function buildGridShape(n) {
  const shape = [["corner", ...Array(n).fill("block")]];
  for (let r = 0; r < n; r++) {
    shape.push(["block", ...Array(n).fill("white")]);
  }
  return shape;
}

/**
 * Satır ve sütunları 1-9 aralığından ayrık değerler alan NxN (n<=9) bir
 * çözüm üretir. Kasıtlı olarak 1..n Latin karesi kullanmıyoruz: o durumda
 * her satır/sütun toplamı sabitlenir (ör. n=4 için her zaman 10) ve
 * ipuçları bilgi vermez hale gelirdi. Bunun yerine geçerli bir 9x9 Latin
 * kareden (değerler 1-9) rastgele n satır ve n sütun seçilir — bir Latin
 * karenin satır/sütunları zaten ayrık olduğundan, herhangi bir alt kümesi
 * de otomatik olarak ayrık kalır (ret örneklemesinden çok daha güvenilir;
 * n büyüdükçe rejection sampling n=6'da %85, n=8'de %100 başarısız oluyordu).
 */
export function generateKakuroSolution(n) {
  const full = generateLatinSquare(9);
  const rowIdx = shuffle([...Array(9).keys()]).slice(0, n);
  const colIdx = shuffle([...Array(9).keys()]).slice(0, n);
  return rowIdx.map((r) => colIdx.map((c) => full[r][c]));
}

export function generate(difficulty = "easy") {
  const n = GRID_SIZE_BY_DIFFICULTY[difficulty] || 4;
  const solution = generateKakuroSolution(n);
  const shape = buildGridShape(n);

  const grid = shape.map((row) => row.map((type) => ({ type })));
  for (let c = 1; c <= n; c++) {
    grid[0][c].clueDown = solution.reduce((sum, row) => sum + row[c - 1], 0);
  }
  for (let r = 1; r <= n; r++) {
    grid[r][0].clueRight = solution[r - 1].reduce((a, b) => a + b, 0);
  }
  const fullSolution = grid.map((row, r) =>
    row.map((cell, c) => (cell.type === "white" ? solution[r - 1][c - 1] : null))
  );

  return { grid, fullSolution, size: n };
}
