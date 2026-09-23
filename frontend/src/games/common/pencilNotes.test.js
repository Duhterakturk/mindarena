import { describe, it, expect } from "vitest";
import { clearCellNotes, emptyNotes, toggleNote } from "./pencilNotes";

describe("pencilNotes", () => {
  it("toggles a candidate digit without touching other cells", () => {
    let notes = emptyNotes(2, 2);
    notes = toggleNote(notes, 0, 1, 3);
    expect(notes[0][1]).toEqual([3]);
    notes = toggleNote(notes, 0, 1, 1);
    expect(notes[0][1]).toEqual([1, 3]);
    notes = toggleNote(notes, 0, 1, 3);
    expect(notes[0][1]).toEqual([1]);
    expect(notes[1][0]).toEqual([]);
  });

  it("clears one cell", () => {
    let notes = emptyNotes(1, 2);
    notes = toggleNote(notes, 0, 0, 2);
    notes = toggleNote(notes, 0, 1, 4);
    notes = clearCellNotes(notes, 0, 0);
    expect(notes[0][0]).toEqual([]);
    expect(notes[0][1]).toEqual([4]);
  });
});
