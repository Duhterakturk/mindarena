// 12 standart pentomino, her biri 5 bitişik hücrenin (r,c) ofset listesi olarak.
export const PENTOMINOES = {
  F: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
  P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
  U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
  X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
};

function normalize(cells) {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - minR, c - minC]);
}

function rotate90(cells) {
  return normalize(cells.map(([r, c]) => [c, -r]));
}

function reflect(cells) {
  return normalize(cells.map(([r, c]) => [r, -c]));
}

export function orient(cells, turns, flipped) {
  let shape = cells;
  if (flipped) shape = reflect(shape);
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) shape = rotate90(shape);
  return shape;
}

export function poseMatching(name, cellKeys) {
  const placed = cellKeys.map((key) => (Array.isArray(key) ? key : key.split("-").map(Number)));
  const minR = Math.min(...placed.map(([r]) => r));
  const minC = Math.min(...placed.map(([, c]) => c));
  const norm = placed.map(([r, c]) => `${r - minR}-${c - minC}`);
  for (const flipped of [false, true]) {
    for (let turns = 0; turns < 4; turns++) {
      const shape = orient(PENTOMINOES[name], turns, flipped).map(([r, c]) => `${r}-${c}`);
      if (shape.length === norm.length && shape.every((key) => norm.includes(key))) {
        return { turns, flipped };
      }
    }
  }
  return { turns: 0, flipped: false };
}

export function randomTransform(cells) {
  return orient(cells, Math.floor(Math.random() * 4), Math.random() < 0.5);
}

// Tıklanan hücre, parçanın herhangi bir karesi olabilir. Sığan ilk yerleşimi döndürür.
export function placementAt(shape, row, col, regionSet, occupied) {
  for (const [sr, sc] of shape) {
    const cells = shape.map(([r, c]) => [r - sr + row, c - sc + col]);
    const fits = cells.every(([r, c]) => regionSet.has(`${r}-${c}`) && !occupied.has(`${r}-${c}`));
    if (fits) return cells;
  }
  return null;
}
