import apiClient from "./client";

export async function fetchUnlockedDifficulties(gameSlug) {
  const { data } = await apiClient.get(`/progress/unlocked/${gameSlug}`);
  return data;
}
