// client/travel-story-app/src/utils/axiosInstance.js
import axios from "axios";
import { BASE_URL } from "./constants";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Tambahkan ini untuk GET requests
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
