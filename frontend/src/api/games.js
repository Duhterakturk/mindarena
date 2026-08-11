import apiClient from "./client";

export async function fetchGames() {
  const { data } = await apiClient.get("/games");
  return data;
}

export async function fetchGame(slug) {
  const { data } = await apiClient.get(`/games/${slug}`);
  return data;
}

export async function submitScore(payload) {
  const { data } = await apiClient.post("/scores", payload);
  return data;
}

export async function fetchLeaderboard(slug) {
  const { data } = await apiClient.get(`/scores/leaderboard/${slug}`);
  return data;
}
