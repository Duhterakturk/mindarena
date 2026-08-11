// 4x4 İşlem Karesi (Calcudoku/KenKen). Kafes (cage) geometrisi ve işlem türü
// sabittir; sayısal hedefler her oynanışta yeni üretilen çözümden hesaplanır.
export const cageId = [
  [1, 1, 2, 2],
  [3, 4, 4, 5],
  [3, 6, 6, 5],
  [7, 7, 8, 8],
];

export const cageOp = {
  1: "+",
  2: "+",
  3: "+",
  4: "×",
  5: "+",
  6: "+",
  7: "+",
  8: "+",
};

// Her kafesin ilk hücresi (r,c) — ipucu metni burada gösterilir
export const cageAnchor = {
  1: [0, 0],
  2: [0, 2],
  3: [1, 0],
  4: [1, 1],
  5: [1, 3],
  6: [2, 1],
  7: [3, 0],
  8: [3, 2],
};

export const cageCells = {
  1: [[0, 0], [0, 1]],
  2: [[0, 2], [0, 3]],
  3: [[1, 0], [2, 0]],
  4: [[1, 1], [1, 2]],
  5: [[1, 3], [2, 3]],
  6: [[2, 1], [2, 2]],
  7: [[3, 0], [3, 1]],
  8: [[3, 2], [3, 3]],
};
