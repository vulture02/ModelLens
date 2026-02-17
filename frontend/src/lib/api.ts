import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

// 🔹 Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers["x-auth-token"] = token;   // ✅ must match backend
  }

  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});


// 🔹 Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response);
    }

    return Promise.reject({
      data: {
        message: "Network error or server not reachable",
      },
    });
  }
);

export default api;
