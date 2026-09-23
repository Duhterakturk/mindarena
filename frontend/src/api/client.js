import axios from "axios";

const apiClient = axios.create({
  // Yerel geliştirmede Vite proxy'si `/api`'yi backend'e yönlendirir. Üretim
  // static build'inde proxy yok, bu yüzden build zamanında `VITE_API_URL`
  // (ör. https://mindarena-backend.onrender.com/api) ayarlanmalı.
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 70000,
});

export function wakeApi() {
  const base = apiClient.defaults.baseURL || "/api";
  fetch(`${String(base).replace(/\/$/, "")}/health`, { cache: "no-store" }).catch(() => {});
}

export async function withWake(task, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const retry = !status || status >= 500 || error.code === "ECONNABORTED" || error.code === "ERR_NETWORK";
      if (!retry || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mindarena_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
