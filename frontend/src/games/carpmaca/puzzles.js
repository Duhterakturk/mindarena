import { shuffle } from "../common/latinSquare";

// Çarpmaca: küçük bir çarpım tablosu. Satır/sütun başlıkları her oynanışta
// 2-9 aralığından rastgele 4'er farklı sayı olarak seçilir.
export function generate() {
  const pool = [2, 3, 4, 5, 6, 7, 8, 9];
  const rowHeaders = shuffle(pool).slice(0, 4);
  const colHeaders = shuffle(pool).slice(0, 4);

  const solution = rowHeaders.map((rh) => colHeaders.map((ch) => rh * ch));
  const puzzle = solution.map((row, r) => row.map((val, c) => ((r === 0 || r === 3) && (c === 0 || c === 3) ? val : 0)));

  return { rowHeaders, colHeaders, puzzle, solution };
}
