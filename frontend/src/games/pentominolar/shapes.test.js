import { describe, it, expect } from "vitest";
import { PENTOMINOES, placementAt, randomTransform } from "./shapes";

function isConnected(cells) {
  const set = new Set(cells.map(([r, c]) => `${r}-${c}`));
  const visited = new Set();
  const stack = [cells[0]];
  visited.add(`${cells[0][0]}-${cells[0][1]}`);
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const key = `${r + dr}-${c + dc}`;
      if (set.has(key) && !visited.has(key)) {
        visited.add(key);
        stack.push([r + dr, c + dc]);
      }
    }
  }
  return visited.size === cells.length;
}

describe("PENTOMINOES", () => {
  it("every base shape has 5 connected cells", () => {
    for (const cells of Object.values(PENTOMINOES)) {
      expect(cells.length).toBe(5);
      expect(isConnected(cells)).toBe(true);
    }
  });
});

describe("placementAt", () => {
  it("places a piece when the click is not the first cell of the shape", () => {
    const shape = PENTOMINOES.P;
    const region = new Set(shape.map(([r, c]) => `${r}-${c}`));
    const cells = placementAt(shape, 2, 0, region, new Set());
    expect(cells).toEqual(shape);
  });

  it("rejects a click the current rotation cannot cover", () => {
    const shape = PENTOMINOES.I;
    const region = new Set(["0-0", "0-1", "0-2", "0-3", "0-4"]);
    expect(placementAt(shape, 0, 0, region, new Set())).toBeNull();
  });
});

describe("randomTransform", () => {
  it("preserves cell count, connectivity, and stays within a 5x5 bounding box", () => {
    const names = Object.keys(PENTOMINOES);
    for (let i = 0; i < 500; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const transformed = randomTransform(PENTOMINOES[name]);

      expect(transformed.length).toBe(5);
      expect(new Set(transformed.map(([r, c]) => `${r}-${c}`)).size).toBe(5);
      expect(isConnected(transformed)).toBe(true);

      const maxR = Math.max(...transformed.map(([r]) => r));
      const maxC = Math.max(...transformed.map(([, c]) => c));
      expect(maxR).toBeLessThanOrEqual(4);
      expect(maxC).toBeLessThanOrEqual(4);
    }
  });
});
