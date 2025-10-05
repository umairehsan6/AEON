import API from "../api/axios";
import { refreshWithStoredToken } from "../api/axios";
// safe jwt-decode import for ESM/CJS builds
import * as jwtDecodeModule from "jwt-decode";
const jwtDecode = jwtDecodeModule?.default ?? jwtDecodeModule;

const SIGNUP_URL = "/api/user/signup/";
const LOGIN_URL = "/api/user/login/";
const LOGOUT_URL = "/api/user/logout/";

let _refreshTimer = null;

function scheduleRefreshFromAccess(access) {
  if (!access) return;
  try {
    const payload = jwtDecode(access);
    const exp = payload.exp; // seconds
    const now = Math.floor(Date.now() / 1000);
    const ms = Math.max((exp - now - 60) * 1000, 0); // refresh 60s early
    if (_refreshTimer) clearTimeout(_refreshTimer);
    _refreshTimer = setTimeout(async () => {
      try {
        await refreshWithStoredToken();
        // reschedule using new token
        const newAccess = localStorage.getItem("access_token");
        if (newAccess) scheduleRefreshFromAccess(newAccess);
      } catch (e) {
        console.error("Proactive refresh failed:", e);
        // cleanup on failure
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        delete API.defaults.headers.common["Authorization"];
      }
    }, ms);
  } catch (e) {
    console.error("Failed to schedule refresh:", e);
  }
}

export const login = async (credentials) => {
  const res = await API.post(LOGIN_URL, credentials);
  const { access, refresh } = res.data || {};
  if (access && refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    API.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    scheduleRefreshFromAccess(access);
    try {
      const decoded = jwtDecode(access);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: decoded.username,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
          role: decoded.role,
        })
      );
    } catch {}
  }
  return res;
};

export const signup = (userData) => API.post(SIGNUP_URL, userData);

export const logout = async (navigate = null) => {
  // try logout endpoint but always clear local state
  try {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await API.post(LOGOUT_URL, { refresh });
  } catch (e) {
    // ignore server errors
  } finally {
    if (_refreshTimer) {
      clearTimeout(_refreshTimer);
      _refreshTimer = null;
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete API.defaults.headers.common["Authorization"];
    if (navigate) navigate("/login");
  }
};

export const initAuth = () => {
  const access = localStorage.getItem("access_token");
  if (access) {
    API.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    scheduleRefreshFromAccess(access);
  }
};