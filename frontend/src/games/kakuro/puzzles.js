import { shuffle } from "../common/latinSquare";

// Kakuro ızgara şekli: 4x4 iç alan, her tam satır ve tam sütun tek bir koşu
// (run) oluşturur. İpucu toplamları her oynanışta yeni üretilen çözümden
// hesaplanır.
export const GRID_SHAPE = [
  ["corner", "block", "block", "block", "block"],
  ["block", "white", "white", "white", "white"],
  ["block", "white", "white", "white", "white"],
  ["block", "white", "white", "white", "white"],
  ["block", "white", "white", "white", "white"],
];

/**
 * Satır ve sütunları birbirinden bağımsız olarak 1-9 aralığından ayrık
 * değerler alan 4x4 bir çözüm üretir. Kasıtlı olarak 1-4 Latin karesi
 * kullanmıyoruz: o durumda her satır/sütun her zaman 1+2+3+4=10 toplarmış
 * gibi tekdüze (bilgi vermeyen) ipuçları ortaya çıkardı. Ret örneklemesiyle
 * (rejection sampling) hem satır hem sütun ayrıklığı sağlanır.
 */
export function generateKakuroSolution(rows = 4, cols = 4, maxVal = 9) {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      grid.push(shuffle(Array.from({ length: maxVal }, (_, i) => i + 1)).slice(0, cols));
    }
    let ok = true;
    for (let c = 0; c < cols; c++) {
      const col = grid.map((row) => row[c]);
      if (new Set(col).size !== cols) {
        ok = false;
        break;
      }
    }
    if (ok) return grid;
  }
  throw new Error("Kakuro çözümü üretilemedi");
}
