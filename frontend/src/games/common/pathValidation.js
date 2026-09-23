// ABC Bağlama ve Patika gibi "işaretli hücreler bir yol oluşturur" tipi
// oyunlar için paylaşılan doğrulama. Bu oyunların üretici (`puzzles.js`)
// kodu, sabit uç noktaları birleştiren TEK bir rastgele öz-kaçınan yol
// üretir; ama iki nokta arasında (özellikle çapraz konumlarda) genellikle
// birden fazla eşit derecede geçerli yatay/dikey yol vardır. Eski kod bu
// TEK üretilen yolu `solutionSet` olarak saklayıp kullanıcının işaretlediği
// hücre kümesiyle birebir eşleştiriyordu — kullanıcı geçerli ama FARKLI bir
// yol çizdiğinde (ör. dikey bir segment içeren bir alternatif), asla doğru
// sayılmıyordu. Bu dosya, üretilen tek yol yerine "geçerli bir yol mu?"
// sorusunu doğrudan geometriden hesaplayarak çözer.

export function pathArms(row, col, marked, fixedCells) {
  const nodes = new Set(marked);
  for (const key of Object.keys(fixedCells)) nodes.add(key);
  return {
    up: nodes.has(`${row - 1}-${col}`),
    down: nodes.has(`${row + 1}-${col}`),
    left: nodes.has(`${row}-${col - 1}`),
    right: nodes.has(`${row}-${col + 1}`),
  };
}

function neighborsOf(key, nodeSet) {
  const [r, c] = key.split("-").map(Number);
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ]
    .map(([rr, cc]) => `${rr}-${cc}`)
    .filter((k) => nodeSet.has(k));
}

function connectedComponents(nodeSet) {
  const visited = new Set();
  const components = [];
  for (const node of nodeSet) {
    if (visited.has(node)) continue;
    const comp = [];
    const stack = [node];
    visited.add(node);
    while (stack.length) {
      const cur = stack.pop();
      comp.push(cur);
      for (const nb of neighborsOf(cur, nodeSet)) {
        if (!visited.has(nb)) {
          visited.add(nb);
          stack.push(nb);
        }
      }
    }
    components.push(comp);
  }
  return components;
}

/**
 * ABC Bağlama: her harf etiketinin tam olarak 2 sabit hücresi var. İşaretli
 * hücreler + sabit hücreler üzerindeki her bağlı bileşen, aynı etikete
 * sahip iki sabit hücreyi birleştiren BASİT bir yol (dallanmasız,
 * döngüsüz) olmalı; başıboş (hiçbir etikete bağlı olmayan) işaretli hücre
 * kalmamalı; ve her etiket çifti bağlanmış olmalı.
 */
export function isConnectionPuzzleSolved(marked, fixedCells) {
  const nodeSet = new Set([...marked, ...Object.keys(fixedCells)]);
  const componentSets = connectedComponents(nodeSet).map((c) => new Set(c));

  const allLabels = new Set(Object.values(fixedCells));
  const solvedLabels = new Set();

  for (const compSet of componentSets) {
    const fixedInComp = [...compSet].filter((k) => fixedCells[k] !== undefined);
    if (fixedInComp.length === 0) return false; // başıboş işaretli hücre grubu
    if (fixedInComp.length !== 2) return false; // 2'den farklı sayıda uç nokta
    const [a, b] = fixedInComp;
    if (fixedCells[a] !== fixedCells[b]) return false; // farklı etiketler birleşmiş

    for (const node of compSet) {
      const deg = neighborsOf(node, compSet).length;
      const isEndpoint = node === a || node === b;
      if (isEndpoint && deg !== 1) return false;
      if (!isEndpoint && deg !== 2) return false;
    }
    solvedLabels.add(fixedCells[a]);
  }

  return allLabels.size > 0 && [...allLabels].every((l) => solvedLabels.has(l));
}

/**
 * Patika: sabit hücreler "1".."N" sırasıyla numaralanmış duraklardır.
 * İşaretli hücreler + sabit hücreler birlikte TEK bir basit yol
 * oluşturmalı ve bu yol boyunca duraklar sırayla (veya ters sırayla,
 * çünkü bir yolun iki ucundan da okunabilir) 1,2,...,N şeklinde
 * karşılaşılmalı.
 */
export function isSequentialPathSolved(marked, fixedCells) {
  const nodeSet = new Set([...marked, ...Object.keys(fixedCells)]);
  if (nodeSet.size === 0) return false;

  const components = connectedComponents(nodeSet);
  if (components.length !== 1) return false; // tek parça olmalı, başıboş hücre yok
  const comp = components[0];
  const compSet = new Set(comp);

  const endpoints = [];
  for (const node of comp) {
    const deg = neighborsOf(node, compSet).length;
    if (deg === 1) endpoints.push(node);
    else if (deg !== 2) return false; // dallanma veya döngü
  }
  if (endpoints.length !== 2) return false;

  // Bir uçtan diğerine yürüyerek sıralı hücre listesini çıkar.
  const ordered = [endpoints[0]];
  const visited = new Set([endpoints[0]]);
  while (ordered[ordered.length - 1] !== endpoints[1]) {
    const cur = ordered[ordered.length - 1];
    const next = neighborsOf(cur, compSet).find((n) => !visited.has(n));
    if (!next) return false;
    ordered.push(next);
    visited.add(next);
  }

  const waypointLabels = ordered.filter((k) => fixedCells[k] !== undefined).map((k) => fixedCells[k]);
  const expected = Object.values(fixedCells)
    .slice()
    .sort((a, b) => Number(a) - Number(b));
  const reversedExpected = [...expected].reverse();
  return (
    waypointLabels.length === expected.length &&
    (waypointLabels.every((l, i) => l === expected[i]) ||
      waypointLabels.every((l, i) => l === reversedExpected[i]))
  );
}
