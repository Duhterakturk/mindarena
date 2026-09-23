import apiClient, { withWake } from "./client";

export async function fetchGames() {
  return withWake(async () => {
    const { data } = await apiClient.get("/games");
    return data;
  });
}

export async function fetchGame(slug) {
  const { data } = await apiClient.get(`/games/${slug}`);
  return data;
}

export const BADGES_EARNED_EVENT = "mindarena:badges-earned";

export async function openPuzzle(slug, difficulty = "easy") {
  return withWake(async () => {
    const { data } = await apiClient.post("/puzzles", { slug, difficulty });
    return data;
  });
}

export async function checkPuzzle(attemptId, answer) {
  const { data } = await apiClient.post(`/puzzles/${attemptId}/check`, { answer });
  return data.correct;
}

export async function openCellHint(attemptId, round) {
  const body = Number.isInteger(round) ? { round } : {};
  const { data } = await apiClient.post(`/puzzles/${attemptId}/cell`, body);
  return data;
}

export async function submitScore(payload) {
  const { data } = await apiClient.post("/scores", payload);
  if (data.new_badges && data.new_badges.length > 0) {
    window.dispatchEvent(new CustomEvent(BADGES_EARNED_EVENT, { detail: data.new_badges }));
  }
  window.dispatchEvent(new CustomEvent("mindarena:score-saved"));
  return data;
}
