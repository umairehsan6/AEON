import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

// set header from storage on startup
const startupAccess = localStorage.getItem("access_token");
if (startupAccess) {
  API.defaults.headers.common["Authorization"] = `Bearer ${startupAccess}`;
}

// refresh endpoint and plain client (no interceptors)
const REFRESH_ENDPOINT = "/api/token/refresh/";
const plain = axios.create({
  baseURL: API.defaults.baseURL,
  headers: { "Content-Type": "application/json" },
});

// refresh control & queue
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

async function performRefresh() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");
  const res = await plain.post(REFRESH_ENDPOINT, { refresh });
  const access = res.data?.access;
  if (!access) throw new Error("No access returned");
  // persist and set header
  localStorage.setItem("access_token", access);
  API.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  return access;
}

// exported helper for proactive refresh
export async function refreshWithStoredToken() {
  return performRefresh();
}

// interceptor handles 401, serializes refresh, retries original request
API.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const url = originalRequest.url || "";
    const isAuthEndpoint =
      url.includes("/api/token/refresh/") ||
      url.includes("/api/user/login") ||
      url.includes("/api/user/signup") ||
      url.includes("/api/user/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // queue and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(API(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const newToken = await performRefresh();
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          resolve(API(originalRequest));
        } catch (err) {
          processQueue(err, null);
          // clear auth state on failure
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          delete API.defaults.headers.common["Authorization"];
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export default API;