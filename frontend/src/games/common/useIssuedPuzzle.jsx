import { useEffect, useState } from "react";
import { openPuzzle } from "../../api/games";
import { publishAttempt } from "./cellHint";
import { usePlayCopy } from "./playCopy";

export function useIssuedPuzzle(slug, difficulty) {
  const [issue, setIssue] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setIssue(null);
    publishAttempt(null);
    openPuzzle(slug, difficulty)
      .then((data) => {
        if (!cancelled) {
          setIssue(data);
          setPhase("ready");
          publishAttempt(data);
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, difficulty, nonce]);

  return { issue, phase, reload: () => setNonce((value) => value + 1) };
}

export function PuzzlePending({ phase }) {
  const play = usePlayCopy();
  return (
    <p className={phase === "error" ? "text-red-500" : "text-slate-500"}>
      {phase === "error" ? play.unavailable : play.loading}
    </p>
  );
}
