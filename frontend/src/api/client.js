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

let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) refreshPromise = refreshAccess().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function refreshAccess() {
  const refresh = localStorage.getItem("mindarena_refresh_token");
  if (!refresh) return Promise.reject(new Error("refresh yok"));
  const base = String(apiClient.defaults.baseURL || "/api").replace(/\/$/, "");
  return axios.post(`${base}/auth/refresh`, {}, { headers: { Authorization: `Bearer ${refresh}` } }).then(({ data }) => {
    localStorage.setItem("mindarena_access_token", data.access_token);
    return data.access_token;
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const url = String(config.url || "");
    if (error.response?.status !== 401 || config._retried || /\/auth\/(login|register|refresh)/.test(url)) {
      return Promise.reject(error);
    }
    try {
      await refreshSession();
      config._retried = true;
      return apiClient(config);
    } catch (refreshError) {
      localStorage.removeItem("mindarena_access_token");
      localStorage.removeItem("mindarena_refresh_token");
      if (!window.location.pathname.startsWith("/login")) window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

export function scoreStatus(error) {
  return error?.response?.status === 400 ? "rejected" : "offline";
}

export default apiClient;
