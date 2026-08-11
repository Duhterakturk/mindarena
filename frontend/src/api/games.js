import apiClient from "./client";

export async function fetchGames() {
  const { data } = await apiClient.get("/games");
  return data;
}

export async function fetchGame(slug) {
  const { data } = await apiClient.get(`/games/${slug}`);
  return data;
}

export const BADGES_EARNED_EVENT = "mindarena:badges-earned";

export async function submitScore(payload) {
  const { data } = await apiClient.post("/scores", payload);
  if (data.new_badges && data.new_badges.length > 0) {
    window.dispatchEvent(new CustomEvent(BADGES_EARNED_EVENT, { detail: data.new_badges }));
  }
  return data;
}

export async function fetchLeaderboard(slug) {
  const { data } = await apiClient.get(`/scores/leaderboard/${slug}`);
  return data;
}
