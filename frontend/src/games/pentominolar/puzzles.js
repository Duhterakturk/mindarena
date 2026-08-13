import { PENTOMINOES, randomTransform } from "./shapes";

// Pentominolar: zorluk, ızgara boyutu ve aynı anda yerleştirilecek/bulunacak
// pentomino sayısıyla ölçeklenir (daha çok parça = daha zor tanıma görevi).
const CONFIG = {
  easy: { gridSize: 5, count: 1 },
  medium: { gridSize: 6, count: 2 },
  hard: { gridSize: 7, count: 3 },
};

function placeShapes(gridSize, count) {
  const names = Object.keys(PENTOMINOES);
  for (let globalAttempt = 0; globalAttempt < 100; globalAttempt++) {
    const occupied = new Set();
    const placements = [];
    let success = true;
    for (let i = 0; i < count; i++) {
      let placed = false;
      for (let tries = 0; tries < 300; tries++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const shape = randomTransform(PENTOMINOES[name]);
        const maxR = Math.max(...shape.map(([r]) => r));
        const maxC = Math.max(...shape.map(([, c]) => c));
        if (maxR >= gridSize || maxC >= gridSize) continue;
        const rOffset = Math.floor(Math.random() * (gridSize - maxR));
        const cOffset = Math.floor(Math.random() * (gridSize - maxC));
        const cells = shape.map(([r, c]) => [r + rOffset, c + cOffset]);
        if (cells.some(([r, c]) => occupied.has(`${r}-${c}`))) continue;
        cells.forEach(([r, c]) => occupied.add(`${r}-${c}`));
        placements.push({ name, shape, cells });
        placed = true;
        break;
      }
      if (!placed) {
        success = false;
        break;
      }
    }
    if (success) return placements;
  }
  throw new Error("Pentomino yerleşimi üretilemedi");
}

export function generate(difficulty = "easy") {
  const { gridSize, count } = CONFIG[difficulty] || CONFIG.easy;
  const placements = placeShapes(gridSize, count);
  const solutionSet = placements.flatMap((p) => p.cells.map(([r, c]) => `${r}-${c}`));
  const shapes = placements.map((p) => p.shape);
  return { shapes, solutionSet, gridSize };
}
