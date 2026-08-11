// 4x4 Futoshiki. Eşitsizlik konumları sabittir; işaret yönü (< / >) her
// oynanışta yeni üretilen çözümden hesaplanır.
export const HORIZONTAL_POSITIONS = [
  { r: 0, c: 0 },
  { r: 1, c: 2 },
];

export const VERTICAL_POSITIONS = [
  { r: 0, c: 1 },
  { r: 2, c: 3 },
];

export const GIVENS_COUNT = 6;
