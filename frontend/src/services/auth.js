import API from "../api/axios";

const SIGNUP_URL = "/api/user/signup/";
const LOGIN_URL = "/api/user/login/";

export const signup = async (userData) => {
  return API.post(SIGNUP_URL, userData); // no token required
};

export const login = async (credentials) => {
  const res = await API.post(LOGIN_URL, credentials);
  const { access, refresh, username, first_name, last_name } = res.data || {};
  if (access && refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify({ username, first_name, last_name }));
    API.defaults.headers.common["Authorization"] = `Bearer ${access}`; // set AFTER login
  }
  return res;
};