import { api } from "@/lib/axios";

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: any;
};
/**
 * Login user dan simpan token di HttpOnly cookie (diset backend)
 */
export async function login(email: string, password: string): Promise<ApiResponse> {
  const res = await api.post("/auth/login", { email, password }, { withCredentials: true });
  return res.data;
}

/**
 * Registrasi user baru
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse> {
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
export async function logout(): Promise<ApiResponse> {
  const res = await api.post("/auth/logout", {}, { withCredentials: true });
  return res.data;
}

/**
 * Refresh access token menggunakan refresh token dari cookie
 */
export async function refreshAccessToken(): Promise<ApiResponse | null> {
  try {
    const res = await api.post("/auth/refresh-token", {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function me(): Promise<
  ApiResponse<{ id: number; name: string; email: string; avatar?: string }>
> {
  const res = await api.get("/users/profile", { withCredentials: true });
  return res.data;
}

export async function updateProfile(payload: { name?: string; email?: string; password?: string }) {
  const res = await api.put("/users/profile", payload, { withCredentials: true });
  return res.data;
}

export async function uploadAvatar(file: File | null) {
  const fd = new FormData();
  fd.append("avatar", file || "");
  const res = await api.put("/users/avatar", fd, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
