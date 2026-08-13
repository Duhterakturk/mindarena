// Sihirli Piramit: taban satırı her oynanışta rastgele üretilir (1-9), üst
// hücreler kendi altındaki iki komşu hücrenin toplamıdır. Zorluk, taban
// satırındaki hücre sayısıyla (dolayısıyla piramidin yüksekliğiyle) ölçeklenir.
const BASE_SIZE_BY_DIFFICULTY = { easy: 4, medium: 5, hard: 6 };

export function generate(difficulty = "easy") {
  const baseSize = BASE_SIZE_BY_DIFFICULTY[difficulty] || 4;
  const rows = [Array.from({ length: baseSize }, () => 1 + Math.floor(Math.random() * 9))];
  while (rows[rows.length - 1].length > 1) {
    const prev = rows[rows.length - 1];
    const next = [];
    for (let i = 0; i < prev.length - 1; i++) next.push(prev[i] + prev[i + 1]);
    rows.push(next);
  }
  rows.reverse(); // en üstte tek hücre, en altta taban satırı

  const solution = rows;
  const puzzle = rows.map((row, idx) => (idx === rows.length - 1 ? row : row.map(() => 0)));
  return { puzzle, solution };
}
