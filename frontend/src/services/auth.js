import API from "../api/axios";

const SIGNUP_URL = "/api/user/signup/";
const LOGIN_URL = "/api/user/login/";

export const signup = async (userData) => {
  return API.post(SIGNUP_URL, userData); // no token required
};

export const login = async (credentials) => {
  console.log('Making login request to:', LOGIN_URL);
  console.log('With credentials:', credentials);
  const res = await API.post(LOGIN_URL, credentials);
  console.log('Login API response:', res);
  const { access, refresh } = res.data || {};
  if (access && refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    // Store user info from JWT token instead of response
    try {
      const { jwtDecode } = await import('jwt-decode');
      const decoded = jwtDecode(access);
      localStorage.setItem("user", JSON.stringify({ 
        username: decoded.username, 
        first_name: decoded.first_name, 
        last_name: decoded.last_name 
      }));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    API.defaults.headers.common["Authorization"] = `Bearer ${access}`; // set AFTER login
    console.log('Tokens stored successfully');
  } else {
    throw new Error('No access or refresh token received');
  }
  return res;
};