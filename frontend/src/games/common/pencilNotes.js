export function emptyNotes(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => []));
}

export function toggleNote(notes, row, col, digit) {
  return notes.map((line, ri) =>
    line.map((list, ci) => {
      if (ri !== row || ci !== col) return list;
      if (list.includes(digit)) return list.filter((value) => value !== digit);
      return [...list, digit].sort((a, b) => a - b);
    }),
  );
}

export function clearCellNotes(notes, row, col) {
  return notes.map((line, ri) => line.map((list, ci) => (ri === row && ci === col ? [] : list)));
}

export function resizeNotes(notes, rows, cols) {
  if (notes?.length === rows && notes[0]?.length === cols) return notes;
  return emptyNotes(rows, cols);
}
