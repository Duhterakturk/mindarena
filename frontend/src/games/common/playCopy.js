import { useTranslation } from "react-i18next";

export function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function usePlayCopy() {
  const { t } = useTranslation();
  return {
    clock(seconds) {
      return t("play.time", { clock: formatClock(seconds) });
    },
    check: t("play.check"),
    newPuzzle: t("play.new"),
    clear: t("play.clear"),
    save: t("play.save"),
    correct: t("play.correct"),
    incorrect: t("play.incorrect"),
    incorrectCells: t("play.incorrectCells"),
    saved: t("play.saved"),
    rejected: t("play.rejected"),
    loading: t("play.loading"),
    unavailable: t("play.unavailable"),
    right: t("play.right"),
    wrong: t("play.wrong"),
    round(current, total) {
      return t("play.round", { current, total });
    },
    result(correct, total) {
      return t("play.result", { correct, total });
    },
    next(value) {
      return t("play.next", { value });
    },
    numbersDone: t("play.numbersDone"),
    noFit: t("play.noFit"),
    rotate: t("play.rotate"),
    flip: t("play.flip"),
    pieces: t("play.pieces"),
    anchor: t("play.anchor"),
  };
}
