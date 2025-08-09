// lib/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

let refreshPromise: Promise<any> | null = null;

const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/refresh"];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;

    const isPublic = publicPaths.some((path) => originalRequest?.url?.startsWith(path));

    if (status === 401 && !isPublic && !originalRequest._retry) {
      originalRequest._retry = true;

      // Cek apakah cookie refresh token ada
      const hasRefreshCookie =
        typeof document !== "undefined" &&
        document.cookie.split(";").some((c) => c.trim().startsWith("refreshToken="));

      if (!hasRefreshCookie) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post("/auth/refresh-token", {}, { withCredentials: true })
            .finally(() => (refreshPromise = null));
        }
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);
