import { describe, it, expect } from "vitest";
import {
  applyMarkCycle,
  cellMarkState,
  edgeIsDrawn,
  nextEdgeState,
  nextMarkState,
} from "./markCycle";

describe("markCycle", () => {
  it("cycles empty → mark → cross → empty", () => {
    expect(nextMarkState("empty")).toBe("mark");
    expect(nextMarkState("mark")).toBe("cross");
    expect(nextMarkState("cross")).toBe("empty");
  });

  it("keeps mark and cross sets exclusive", () => {
    let marked = new Set();
    let crossed = new Set();
    ({ marked, crossed } = applyMarkCycle(marked, crossed, "0-0"));
    expect(cellMarkState(marked, crossed, "0-0")).toBe("mark");
    ({ marked, crossed } = applyMarkCycle(marked, crossed, "0-0"));
    expect(cellMarkState(marked, crossed, "0-0")).toBe("cross");
    expect(marked.has("0-0")).toBe(false);
    ({ marked, crossed } = applyMarkCycle(marked, crossed, "0-0"));
    expect(cellMarkState(marked, crossed, "0-0")).toBe("empty");
  });

  it("cycles fence edges and only counts drawn lines as answers", () => {
    expect(nextEdgeState(false)).toBe(true);
    expect(nextEdgeState(true)).toBe("x");
    expect(nextEdgeState("x")).toBe(false);
    expect(edgeIsDrawn(true)).toBe(true);
    expect(edgeIsDrawn("x")).toBe(false);
    expect(edgeIsDrawn(false)).toBe(false);
  });
});
