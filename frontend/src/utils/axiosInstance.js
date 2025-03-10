import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/v1/api/",
});

// Request Interceptor (if needed for adding tokens to headers)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Replace with your token retrieval logic
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      const navigate = useNavigate(); // Hook for programmatic navigation
      navigate("/login"); // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
