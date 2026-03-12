import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getStoredToken() {
  return localStorage.getItem("bazzario_access_token") || "";
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem("bazzario_access_token");
    return;
  }
  localStorage.setItem("bazzario_access_token", token);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
