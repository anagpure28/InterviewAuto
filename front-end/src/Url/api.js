import axios from "axios";
import { url } from "./url.js";
import { getToken, clearAuth } from "../utils/auth.js";

// A single axios instance for the whole app so every request automatically:
//   1. targets the backend base URL,
//   2. carries the JWT (Authorization: Bearer <token>) when we have one,
//   3. on a 401 (missing / expired / revoked token) logs the user out and
//      bounces them to the login page.
const api = axios.create({ baseURL: url });

// --- Request: attach the token ------------------------------------------------
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: handle expired / revoked sessions ------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const reqUrl = error?.config?.url || "";
    // Don't hijack 401s from the auth endpoints themselves (e.g. a wrong
    // password on /auth/login) — those pages show their own message.
    const isAuthCall = reqUrl.includes("/auth/");
    if (status === 401 && !isAuthCall) {
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
