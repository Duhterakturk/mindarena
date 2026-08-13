// Çit (Slitherlink), NxN hücrelik bir döngü bulmacası. Her hücredeki sayı, o
// hücreyi çevreleyen kaç kenarın çizili (döngünün parçası) olması gerektiğini
// belirtir. Rastgele bir dikdörtgen alt-bölge seçilip onun sınırı döngü
// olarak kullanılır — bir dikdörtgenin sınırı her zaman geçerli, basit
// (kesişmeyen) kapalı bir döngü olduğundan bu yöntem her seferinde geçerli
// bir bulmaca üretir. Zorluk, ızgara boyutuyla ölçeklenir.
const SIZE_BY_DIFFICULTY = { easy: 2, medium: 3, hard: 4 };

export function generate(difficulty = "easy") {
  const n = SIZE_BY_DIFFICULTY[difficulty] || 2;
  const r1 = Math.floor(Math.random() * n);
  const r2 = r1 + Math.floor(Math.random() * (n - r1));
  const c1 = Math.floor(Math.random() * n);
  const c2 = c1 + Math.floor(Math.random() * (n - c1));

  const horizontalSolution = Array.from({ length: n + 1 }, () => Array(n).fill(false));
  const verticalSolution = Array.from({ length: n }, () => Array(n + 1).fill(false));

  for (let c = c1; c <= c2; c++) {
    horizontalSolution[r1][c] = true;
    horizontalSolution[r2 + 1][c] = true;
  }
  for (let r = r1; r <= r2; r++) {
    verticalSolution[r][c1] = true;
    verticalSolution[r][c2 + 1] = true;
  }

  const clues = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let count = 0;
      if (horizontalSolution[i][j]) count++;
      if (horizontalSolution[i + 1][j]) count++;
      if (verticalSolution[i][j]) count++;
      if (verticalSolution[i][j + 1]) count++;
      clues[i][j] = count;
    }
  }

  return { clues, horizontalSolution, verticalSolution, size: n };
}
