import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  console.log("Sending JWT in request:", token)
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

export default api;
