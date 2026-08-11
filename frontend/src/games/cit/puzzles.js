// Çit (Slitherlink), 2x2 hücrelik bir döngü bulmacası. Her hücredeki sayı, o
// hücreyi çevreleyen kaç kenarın çizili (döngünün parçası) olması gerektiğini
// belirtir. Rastgele bir dikdörtgen alt-bölge seçilip onun sınırı döngü
// olarak kullanılır — bir dikdörtgenin sınırı her zaman geçerli, basit
// (kesişmeyen) kapalı bir döngü olduğundan bu yöntem her seferinde geçerli
// bir bulmaca üretir.
export function generate() {
  // Hücre koordinatları 0-1 aralığında (2x2 hücre ızgarası)
  const r1 = Math.floor(Math.random() * 2);
  const r2 = r1 + Math.floor(Math.random() * (2 - r1));
  const c1 = Math.floor(Math.random() * 2);
  const c2 = c1 + Math.floor(Math.random() * (2 - c1));

  const horizontalSolution = [
    [false, false],
    [false, false],
    [false, false],
  ];
  const verticalSolution = [
    [false, false, false],
    [false, false, false],
  ];

  for (let c = c1; c <= c2; c++) {
    horizontalSolution[r1][c] = true;
    horizontalSolution[r2 + 1][c] = true;
  }
  for (let r = r1; r <= r2; r++) {
    verticalSolution[r][c1] = true;
    verticalSolution[r][c2 + 1] = true;
  }

  const clues = [
    [0, 0],
    [0, 0],
  ];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let count = 0;
      if (horizontalSolution[i][j]) count++;
      if (horizontalSolution[i + 1][j]) count++;
      if (verticalSolution[i][j]) count++;
      if (verticalSolution[i][j + 1]) count++;
      clues[i][j] = count;
    }
  }

  return { clues, horizontalSolution, verticalSolution };
}
