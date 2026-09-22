import { shuffle, generateLatinSquare } from "../common/latinSquare";
import { countKakuro } from "../common/solvers";

const GIVENS_BY_DIFFICULTY = { easy: 6, medium: 12, hard: 18 };

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
  const keep = GIVENS_BY_DIFFICULTY[difficulty] ?? 6;
  for (let attempt = 0; attempt < 8; attempt++) {
    const solution = generateKakuroSolution(n);
    const rowSums = solution.map((row) => row.reduce((a, b) => a + b, 0));
    const colSums = Array.from({ length: n }, (_, c) => solution.reduce((sum, row) => sum + row[c], 0));
    const givens = solution.map((row) => [...row]);
    const cells = shuffle(Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n]));
    for (const [r, c] of cells) {
      const filled = givens.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
      if (filled <= keep) break;
      const backup = givens[r][c];
      givens[r][c] = 0;
      if (countKakuro(rowSums, colSums, givens) !== 1) givens[r][c] = backup;
    }
    const shape = buildGridShape(n);
    const grid = shape.map((row) => row.map((type) => ({ type })));
    for (let c = 1; c <= n; c++) grid[0][c].clueDown = colSums[c - 1];
    for (let r = 1; r <= n; r++) grid[r][0].clueRight = rowSums[r - 1];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (givens[r][c]) grid[r + 1][c + 1].given = givens[r][c];
      }
    }
    const fullSolution = grid.map((row, r) =>
      row.map((cell, c) => (cell.type === "white" ? solution[r - 1][c - 1] : null))
    );
    return { grid, fullSolution, size: n, rowSums, colSums, givens };
  }
  throw new Error("Tek çözüm Çapraz Toplam üretilemedi");
}
