import axios from "axios";

// In development this falls back to localhost. In production, set
// VITE_API_URL (in a .env file, or your hosting platform's environment
// variables) to your deployed backend's URL, e.g.
// VITE_API_URL=https://digital-fridge-api.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
