import apiClient from "./client";

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function login(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await apiClient.post("/auth/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
}

export async function forgotPassword(email) {
  const { data } = await apiClient.post("/auth/forgot", { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await apiClient.post("/auth/reset", { token, password });
  return data;
}
