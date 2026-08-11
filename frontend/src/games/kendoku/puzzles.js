// 4x4 Kendoku. Kafes geometrisi ve işlem türü sabittir; sayısal hedefler her
// oynanışta yeni üretilen çözümden hesaplanır. Bölme tam bölünmediğinde
// computeCageClue otomatik olarak çıkarmaya düşer (bkz. common/latinSquare.js).
export const cageId = [
  [1, 2, 2, 3],
  [1, 4, 5, 3],
  [6, 4, 5, 7],
  [6, 8, 8, 7],
];

export const cageOp = {
  1: "−",
  2: "+",
  3: "−",
  4: "+",
  5: "−",
  6: "+",
  7: "−",
  8: "÷",
};

export const cageAnchor = {
  1: [0, 0],
  2: [0, 1],
  3: [0, 3],
  4: [1, 1],
  5: [1, 2],
  6: [2, 0],
  7: [2, 3],
  8: [3, 1],
};

export const cageCells = {
  1: [[0, 0], [1, 0]],
  2: [[0, 1], [0, 2]],
  3: [[0, 3], [1, 3]],
  4: [[1, 1], [2, 1]],
  5: [[1, 2], [2, 2]],
  6: [[2, 0], [3, 0]],
  7: [[2, 3], [3, 3]],
  8: [[3, 1], [3, 2]],
};
