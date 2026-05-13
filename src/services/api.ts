import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.disasterlink.gov/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("dl_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dl_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
