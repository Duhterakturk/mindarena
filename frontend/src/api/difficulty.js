import apiClient from "./client";

export async function fetchUnlockedDifficulties(gameSlug) {
  const { data } = await apiClient.get(`/progress/unlocked/${gameSlug}`);
  return data;
}

export async function fetchAllUnlocked() {
  const { data } = await apiClient.get("/progress/unlocked-all");
  return data;
}
