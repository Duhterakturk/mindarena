import { PENTOMINOES, randomTransform } from "./shapes";

const GRID_SIZE = 5;

export function generate() {
  const names = Object.keys(PENTOMINOES);
  const name = names[Math.floor(Math.random() * names.length)];
  const shape = randomTransform(PENTOMINOES[name]);

  const maxR = Math.max(...shape.map(([r]) => r));
  const maxC = Math.max(...shape.map(([, c]) => c));
  const rOffset = Math.floor(Math.random() * (GRID_SIZE - maxR));
  const cOffset = Math.floor(Math.random() * (GRID_SIZE - maxC));

  const solutionSet = shape.map(([r, c]) => `${r + rOffset}-${c + cOffset}`);

  return { name, shape, solutionSet, gridSize: GRID_SIZE };
}
