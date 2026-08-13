// 4x4 Bölgesel (Jigsaw) Sudoku. Bölge şekli sabittir (düzensiz bölgeler için
// rastgele satır/sütun permütasyonu kısıtı bozar); her oynanışta yalnızca
// rakamlar yeniden etiketlenir (bkz. common/latinSquare.js -> relabelGrid).
export const BASE_SOLUTION = [
  [1, 2, 3, 4],
  [2, 4, 1, 3],
  [3, 1, 4, 2],
  [4, 3, 2, 1],
];

// Her hücrenin ait olduğu bölge (A/B/C/D)
export const REGIONS = [
  ["A", "A", "A", "B"],
  ["C", "A", "B", "B"],
  ["C", "C", "D", "B"],
  ["C", "D", "D", "D"],
];

export const GIVENS_BY_DIFFICULTY = { easy: 11, medium: 8, hard: 5 };
