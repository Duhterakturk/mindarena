// Latin kare / Sudoku tabanlı oyunlar (Sudoku, Kakuro, Bölgesel Sudoku, Apartman,
// Futoshiki, İşlem Karesi, Kendoku, Çarpmaca) için paylaşılan rastgele bulmaca
// üretim altyapısı. Geometri (bölgeler, kafesler, ipucu konumları) her oyunun
// kendi dosyasında sabit kalır; burada yalnızca geçerli bir çözüm ızgarası ve
// o çözümden kaç hücrenin "verilen" (given) olarak bırakılacağı üretilir.

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * n×n boyutunda rastgele geçerli bir Latin kare üretir (her satır ve sütun
 * 1..n rakamlarını birer kez içerir). Döngüsel taban karesi üzerinde rastgele
 * satır/sütun permütasyonu ve rakam yeniden etiketleme uygulanır.
 */
export function generateLatinSquare(n) {
  const rowOrder = shuffle(Array.from({ length: n }, (_, i) => i));
  const colOrder = shuffle(Array.from({ length: n }, (_, i) => i));
  const digitMap = shuffle(Array.from({ length: n }, (_, i) => i + 1));

  const grid = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) {
      const base = (rowOrder[r] + colOrder[c]) % n;
      row.push(digitMap[base]);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Geçerli, rastgele bir 9x9 Sudoku çözümü üretir (satır/sütun/3x3 kutu
 * kısıtlarının hepsini sağlar). Kanonik çözümden başlayıp bant/yığın
 * (band/stack) içi satır-sütun karıştırma, bant/yığın takası, rastgele
 * transpoz ve rakam yeniden etiketleme uygulanır — hepsi geçerliliği korur.
 */
export function generateSudokuSolution() {
  const canonical = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1)
  );

  const bandOrder = shuffle([0, 1, 2]);
  const stackOrder = shuffle([0, 1, 2]);
  const rowInBand = [shuffle([0, 1, 2]), shuffle([0, 1, 2]), shuffle([0, 1, 2])];
  const colInStack = [shuffle([0, 1, 2]), shuffle([0, 1, 2]), shuffle([0, 1, 2])];
  const digitMap = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const transpose = Math.random() < 0.5;

  const rowMap = [];
  for (let b = 0; b < 3; b++) {
    for (let i = 0; i < 3; i++) {
      rowMap.push(bandOrder[b] * 3 + rowInBand[b][i]);
    }
  }
  const colMap = [];
  for (let s = 0; s < 3; s++) {
    for (let i = 0; i < 3; i++) {
      colMap.push(stackOrder[s] * 3 + colInStack[s][i]);
    }
  }

  const result = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = digitMap[canonical[rowMap[r]][colMap[c]] - 1];
      if (transpose) result[c][r] = value;
      else result[r][c] = value;
    }
  }
  return result;
}

/**
 * `solution` üzerinden, yalnızca `keepCount` kadar hücreyi "verilen" (given)
 * bırakan bir bulmaca ızgarası üretir (kalanlar 0). Verilen hücreler
 * rastgele seçilir.
 */
export function carvePuzzle(solution, keepCount) {
  const rows = solution.length;
  const cols = solution[0].length;
  const allCells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) allCells.push([r, c]);
  const keep = new Set(shuffle(allCells).slice(0, keepCount).map(([r, c]) => `${r}-${c}`));

  return solution.map((row, r) => row.map((val, c) => (keep.has(`${r}-${c}`) ? val : 0)));
}

/**
 * Sabit bir taban ızgaradaki rakamları rastgele yeniden etiketler (1..n'in
 * rastgele bir permütasyonuyla eşler). Hücre konumları değişmez — bu yüzden
 * düzensiz bölgeler gibi konuma bağlı kısıtları koruyan tek güvenli
 * "rastgeleleştirme" biçimidir (satır/sütun permütasyonu bölge kısıtını bozar).
 */
export function relabelGrid(baseGrid, n) {
  const digitMap = shuffle(Array.from({ length: n }, (_, i) => i + 1));
  return baseGrid.map((row) => row.map((v) => digitMap[v - 1]));
}

/**
 * Bir kafesin (cage) işlem sonucunu değerlerden hesaplar. `−` ve `÷` yalnızca
 * 2 hücreli kafeslerde anlamlıdır; bölme tam bölünmüyorsa otomatik olarak
 * çıkarmaya (`−`) düşer, böylece herhangi bir rastgele çözümle her zaman
 * geçerli bir ipucu üretilir.
 */
export function computeCageClue(op, values) {
  if (op === "+") return { op, target: values.reduce((a, b) => a + b, 0) };
  if (op === "×") return { op, target: values.reduce((a, b) => a * b, 1) };
  if (op === "−") return { op, target: Math.abs(values[0] - values[1]) };
  if (op === "÷") {
    const [a, b] = values;
    const [big, small] = a > b ? [a, b] : [b, a];
    if (small !== 0 && big % small === 0) return { op, target: big / small };
    return { op: "−", target: Math.abs(a - b) };
  }
  throw new Error(`Bilinmeyen işlem: ${op}`);
}

export const DIFFICULTY_LEVELS = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};
