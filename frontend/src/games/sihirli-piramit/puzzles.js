// Sihirli Piramit: taban satırı her oynanışta rastgele üretilir (1-9), üst
// hücreler kendi altındaki iki komşu hücrenin toplamıdır.
export function generate() {
  const base = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 9));
  const row2 = [base[0] + base[1], base[1] + base[2], base[2] + base[3]];
  const row1 = [row2[0] + row2[1], row2[1] + row2[2]];
  const row0 = [row1[0] + row1[1]];

  const solution = [row0, row1, row2, base];
  const puzzle = [[0], [0, 0], [0, 0, 0], base];
  return { puzzle, solution };
}
