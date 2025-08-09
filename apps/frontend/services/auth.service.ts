import { api } from "@/lib/axios";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  if (res.data.success) {
    localStorage.setItem("accessToken", res.data.data.accessToken);
    localStorage.setItem("refreshToken", res.data.data.refreshToken);
  }
  return res.data;
}

export async function register(name: string, email: string, password: string) {
  return (await api.post("/auth/register", { name, email, password })).data;
}

export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");
  await api.post("/auth/logout", { refreshToken });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  const res = await api.post("/auth/refresh", { refreshToken });
  if (res.data.success) {
    localStorage.setItem("accessToken", res.data.data.accessToken);
    return res.data.data.accessToken;
  }
  return null;
}
