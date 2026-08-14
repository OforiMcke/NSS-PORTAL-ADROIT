import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASEURL;

if (!BASE_URL) {
  console.error(
    "VITE_BASEURL is not set — API requests will fail. Check your Vercel environment variables.",
  );
}

export const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired — wiping auth data.");

      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");

      window.location.href = "/signin";
    }
    return Promise.reject(error);
  },
);

export default api;
