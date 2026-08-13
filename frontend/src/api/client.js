import axios from "axios";

const apiClient = axios.create({
  // Yerel geliştirmede Vite proxy'si `/api`'yi backend'e yönlendirir. Üretim
  // static build'inde proxy yok, bu yüzden build zamanında `VITE_API_URL`
  // (ör. https://mindarena-backend.onrender.com/api) ayarlanmalı.
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mindarena_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
