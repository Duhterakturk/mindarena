import { useEffect, useRef } from "react";

let currentAttempt = null;
let currentHint = null;
let hintFocus = null;

export function publishHintFocus(round) {
  hintFocus = Number.isInteger(round) ? round : null;
}

export function currentHintFocus() {
  return hintFocus;
}

export function publishAttempt(issue) {
  hintFocus = null;
  currentAttempt = issue ? { id: issue.id, hint: issue.hint || null } : null;
  currentHint = issue?.hint || null;
  window.dispatchEvent(new CustomEvent("mindarena:attempt", { detail: currentAttempt }));
  if (currentHint) {
    window.dispatchEvent(new CustomEvent("mindarena:cell-hint", { detail: currentHint }));
  }
}

export function publishCellHint(hint) {
  currentHint = hint;
  if (currentAttempt) currentAttempt = { ...currentAttempt, hint };
  window.dispatchEvent(new CustomEvent("mindarena:attempt", { detail: currentAttempt }));
  window.dispatchEvent(new CustomEvent("mindarena:cell-hint", { detail: hint }));
}

export function useApplyCellHint(token, apply) {
  const ref = useRef(apply);
  ref.current = apply;
  useEffect(() => {
    if (currentHint) ref.current(currentHint);
    function handle(event) {
      if (event.detail) ref.current(event.detail);
    }
    window.addEventListener("mindarena:cell-hint", handle);
    return () => window.removeEventListener("mindarena:cell-hint", handle);
  }, [token]);
}

export function writeFill(setBoard, hint, rowShift = 0, colShift = 0) {
  if (!hint || hint.kind !== "fill") return;
  setBoard((prev) => {
    if (!prev) return prev;
    const row = hint.row + rowShift;
    const col = hint.col + colShift;
    if (!prev[row]) return prev;
    const next = prev.map((line) => [...line]);
    next[row][col] = hint.value;
    return next;
  });
}
