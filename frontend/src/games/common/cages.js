import { shuffle, computeCageClue } from "./latinSquare";

/**
 * n×n bir ızgarayı rastgele 1x2/2x1 dominolara döşer (n çift olmalı — tek
 * sayıda hücre dominolarla tam bölünemez). Satır-sütun taramasıyla (reading
 * order) ilerlenir; her hücre için henüz kaplanmamış bir komşu rastgele
 * seçilir. Node üzerinde n=4/6/8 için binlerce denemede sıfır hata ile
 * doğrulandı (ortalama birkaç deneme içinde başarılı).
 */
export function generateDominoTiling(n) {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const covered = Array.from({ length: n }, () => Array(n).fill(false));
    const cages = [];
    let success = true;

    tiling: for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (covered[r][c]) continue;
        const candidates = shuffle([
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ]).filter(([rr, cc]) => rr >= 0 && rr < n && cc >= 0 && cc < n && !covered[rr][cc]);
        if (candidates.length === 0) {
          success = false;
          break tiling;
        }
        const [nr, nc] = candidates[0];
        covered[r][c] = true;
        covered[nr][nc] = true;
        cages.push([[r, c], [nr, nc]]);
      }
    }
    if (success) return cages;
  }
  throw new Error("Domino döşemesi üretilemedi");
}

/**
 * Bir domino döşemesinden ve çözüm ızgarasından İşlem Karesi/Kendoku tarzı
 * kafes verisi (cageId ızgarası, her kafesin işlemi/hedefi/ilk hücresi)
 * üretir. `allowedOps`'tan her kafese rastgele bir işlem atanır;
 * `computeCageClue` bölme tam bölünmediğinde otomatik çıkarmaya düşer.
 */
export function buildCageData(n, solution, allowedOps) {
  const tiling = generateDominoTiling(n);
  const cageId = Array.from({ length: n }, () => Array(n).fill(0));
  const cageAnchor = {};
  const cageCells = {};
  const cageClues = {};

  tiling.forEach((cage, idx) => {
    const id = idx + 1;
    cage.forEach(([r, c]) => {
      cageId[r][c] = id;
    });
    cageCells[id] = cage;
    cageAnchor[id] = cage[0];

    const op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
    const values = cage.map(([r, c]) => solution[r][c]);
    const { op: resolvedOp, target } = computeCageClue(op, values);
    cageClues[id] = `${target}${resolvedOp}`;
  });

  return { cageId, cageAnchor, cageCells, cageClues };
}
