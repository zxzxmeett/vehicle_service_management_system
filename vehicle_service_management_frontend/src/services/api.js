import axios from "axios";

// base url for api(localhost:5000/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
// if token exists in local storage, add it to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
