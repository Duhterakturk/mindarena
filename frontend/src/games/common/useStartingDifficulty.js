import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useStartingDifficulty() {
  const [params] = useSearchParams();
  const asked = params.get("difficulty");
  const initial = asked === "medium" || asked === "hard" ? asked : "easy";
  return useState(initial);
}
