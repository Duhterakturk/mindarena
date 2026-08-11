import apiClient from "./client";

export async function fetchChildren() {
  const { data } = await apiClient.get("/users/children");
  return data;
}

export async function linkChild(email) {
  const { data } = await apiClient.post("/users/children/link", { email });
  return data;
}
