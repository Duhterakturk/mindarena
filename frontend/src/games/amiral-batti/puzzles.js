// Amiral Battı: 5x5 ızgarada [3,2,1,1] uzunluklarında bir filo, hiçbir gemi
// birbirine (çapraz dahil) değmeyecek şekilde rastgele yerleştirilir.
const ROWS = 5;
const COLS = 5;
const SHIP_SIZES = [3, 2, 1, 1];

function placeFleet() {
  for (let attempt = 0; attempt < 500; attempt++) {
    const occupied = new Set();
    let success = true;
    for (const size of SHIP_SIZES) {
      let placed = false;
      for (let tries = 0; tries < 300; tries++) {
        const horizontal = Math.random() < 0.5;
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        const cells = [];
        let inBounds = true;
        for (let i = 0; i < size; i++) {
          const rr = horizontal ? r : r + i;
          const cc = horizontal ? c + i : c;
          if (rr >= ROWS || cc >= COLS) {
            inBounds = false;
            break;
          }
          cells.push([rr, cc]);
        }
        if (!inBounds) continue;

        let conflict = false;
        for (const [rr, cc] of cells) {
          for (let dr = -1; dr <= 1 && !conflict; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (occupied.has(`${rr + dr}-${cc + dc}`)) {
                conflict = true;
                break;
              }
            }
          }
          if (conflict) break;
        }
        if (conflict) continue;

        cells.forEach(([rr, cc]) => occupied.add(`${rr}-${cc}`));
        placed = true;
        break;
      }
      if (!placed) {
        success = false;
        break;
      }
    }
    if (success) return occupied;
  }
  throw new Error("Filo yerleştirilemedi");
}

export function generate() {
  const occupied = placeFleet();
  const solutionSet = [...occupied];

  const rowClues = Array.from({ length: ROWS }, (_, r) =>
    solutionSet.filter((key) => Number(key.split("-")[0]) === r).length
  );
  const colClues = Array.from({ length: COLS }, (_, c) =>
    solutionSet.filter((key) => Number(key.split("-")[1]) === c).length
  );

  return { solutionSet, rowClues, colClues };
}
