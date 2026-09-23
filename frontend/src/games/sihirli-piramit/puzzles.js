// Sihirli Piramit: daireler dolu gelir. Tepeden tabana her sıradan bir daire
// seçilir, adım yalnız alttaki komşu daireye iner. Yoldaki sayılar 1'den
// sıra sayısına kadar her birini bir kez içerir.
const HEIGHT = { easy: 4, medium: 5, hard: 6 };

function digits(count) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

function shuffle(list, random) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

export function pathValues(rows, cols) {
  return cols.map((col, row) => rows[row][col]);
}

export function pathIsMagic(rows, cols) {
  const height = rows.length;
  if (!Array.isArray(cols) || cols.length !== height || cols[0] !== 0) return false;
  for (let row = 1; row < height; row += 1) {
    const col = cols[row];
    const previous = cols[row - 1];
    if (col !== previous && col !== previous + 1) return false;
  }
  const values = pathValues(rows, cols);
  return new Set(values).size === height && digits(height).every((digit) => values.includes(digit));
}

function walkPaths(height, visit) {
  function walk(cols) {
    if (cols.length === height) {
      visit(cols);
      return;
    }
    const previous = cols[cols.length - 1];
    cols.push(previous);
    walk(cols);
    cols.pop();
    cols.push(previous + 1);
    walk(cols);
    cols.pop();
  }
  walk([0]);
}

export function countPaths(rows) {
  let count = 0;
  walkPaths(rows.length, (cols) => {
    if (pathIsMagic(rows, cols)) count += 1;
  });
  return count;
}

function randomPath(height, random) {
  const cols = [0];
  for (let row = 1; row < height; row += 1) {
    cols.push(cols[row - 1] + (random() < 0.5 ? 0 : 1));
  }
  return cols;
}

function spoilExtras(rows, solution, random) {
  const onPath = new Set(solution.map((col, row) => `${row}-${col}`));
  const used = pathValues(rows, solution);
  walkPaths(rows.length, (cols) => {
    if (solution.every((col, row) => col === cols[row]) || !pathIsMagic(rows, cols)) return;
    const options = [];
    cols.forEach((col, row) => {
      if (!onPath.has(`${row}-${col}`)) options.push([row, col]);
    });
    if (!options.length) return;
    const [row, col] = options[Math.floor(random() * options.length)];
    rows[row][col] = used[Math.floor(random() * used.length)];
  });
}

export function generate(difficulty = "easy", random = Math.random) {
  const height = HEIGHT[difficulty] || 4;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const path = randomPath(height, random);
    const order = shuffle(digits(height), random);
    const rows = Array.from({ length: height }, (_, row) =>
      Array.from({ length: row + 1 }, () => 1 + Math.floor(random() * height)),
    );
    path.forEach((col, row) => {
      rows[row][col] = order[row];
    });
    for (let pass = 0; pass < 4; pass += 1) spoilExtras(rows, path, random);
    if (pathIsMagic(rows, path) && countPaths(rows) === 1) return { rows, path };
  }
  throw new Error("Sihirli piramit üretilemedi");
}
