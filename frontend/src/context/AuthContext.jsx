import { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest, register as registerRequest, fetchMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mindarena_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("mindarena_access_token");
        localStorage.removeItem("mindarena_refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  function persistTokens({ access_token, refresh_token }) {
    localStorage.setItem("mindarena_access_token", access_token);
    localStorage.setItem("mindarena_refresh_token", refresh_token);
  }

  async function login(credentials) {
    const data = await loginRequest(credentials);
    persistTokens(data);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await registerRequest(payload);
    persistTokens(data);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("mindarena_access_token");
    localStorage.removeItem("mindarena_refresh_token");
    setUser(null);
  }

  async function refreshUser() {
    const data = await fetchMe();
    setUser(data);
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
