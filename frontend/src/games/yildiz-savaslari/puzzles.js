import { shuffle } from "../common/latinSquare";

// Yıldız Savaşları: 5x5 ızgarada her satır/sütunda tam bir yıldız, hiçbir
// yıldız birbirine (çapraz dahil) komşu olmayacak şekilde rastgele üretilir.
export function generate(n = 5) {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const cols = shuffle(Array.from({ length: n }, (_, i) => i));
    let ok = true;
    for (let r = 0; r < n && ok; r++) {
      for (let r2 = r + 1; r2 < n; r2++) {
        if (Math.abs(r - r2) <= 1 && Math.abs(cols[r] - cols[r2]) <= 1) {
          ok = false;
          break;
        }
      }
    }
    if (ok) {
      const solutionSet = cols.map((c, r) => `${r}-${c}`);
      return { solutionSet, rowClues: Array(n).fill(1), colClues: Array(n).fill(1) };
    }
  }
  throw new Error("Yıldız yerleşimi üretilemedi");
}
