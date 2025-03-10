import { jwtDecode } from "jwt-decode";

export const setToken = (token) => localStorage.setItem("token", token);

export const getToken = () => localStorage.getItem("token");

export const removeToken = () => localStorage.removeItem("token");

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  const decoded = jwtDecode(token);
  const now = Date.now() / 1000; // Current time in seconds
  console.log("decoded token", decoded.exp > now);
  return decoded.exp > now; // Check if the token is still valid
};
