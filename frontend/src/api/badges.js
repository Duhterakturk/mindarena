import apiClient from "./client";

export async function fetchBadges() {
  const { data } = await apiClient.get("/badges");
  return data;
}

export async function fetchMyBadges() {
  const { data } = await apiClient.get("/badges/me");
  return data;
}
