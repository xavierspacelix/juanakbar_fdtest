import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true, // VERY IMPORTANT to send/receive cookies
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// request interceptor can attach nothing (cookies sent automatically)
api.interceptors.request.use((config) => config);

// response interceptor: try refresh once on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;

    // guard: only attempt once per request
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // call refresh endpoint (cookies sent automatically)
        await api.post("/auth/refresh-token");
        // retry original request
        return api(originalRequest);
      } catch (refreshErr) {
        // refresh failed → redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);
