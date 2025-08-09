import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // ignore on SSR
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
