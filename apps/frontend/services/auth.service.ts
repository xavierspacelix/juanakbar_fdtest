import { api } from "@/lib/axios";

/**
 * Login user dan simpan token di HttpOnly cookie (diset backend)
 */
export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password }, { withCredentials: true });
  return res.data;
}

/**
 * Registrasi user baru
 */
export async function register(name: string, email: string, password: string) {
  const res = await api.post(
    "/auth/register",
    { name, email, password },
    { withCredentials: true }
  );
  return res.data;
}

/**
 * Logout user: hapus cookies token di backend
 */
export async function logout() {
  const res = await api.post("/auth/logout", {}, { withCredentials: true });
  return res.data;
}

/**
 * Refresh access token menggunakan refresh token dari cookie
 */
export async function refreshAccessToken() {
  try {
    const res = await api.post("/auth/refresh", {}, { withCredentials: true });
    return res.data;
  } catch {
    return null;
  }
}
