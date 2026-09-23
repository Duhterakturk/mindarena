import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import NotesOverlay from "./NotesOverlay";

describe("NotesOverlay", () => {
  it("pins candidate digits above the white cell", () => {
    const html = renderToStaticMarkup(createElement(NotesOverlay, { digits: [1, 3], maxDigit: 4 }));
    expect(html).toContain("cell-notes");
    expect(html).toContain("z-20");
    expect(html).toContain(">1<");
    expect(html).toContain(">3<");
    expect(html).not.toContain(">2<");
    expect(html).not.toContain("text-slate-500");
  });

  it("draws nothing when the cell has no candidates", () => {
    expect(renderToStaticMarkup(createElement(NotesOverlay, { digits: [], maxDigit: 9 }))).toBe("");
  });
});
