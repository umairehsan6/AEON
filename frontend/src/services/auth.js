import API from "../api/axios";

const SIGNUP_URL = "/api/user/signup/";
const LOGIN_URL = "/api/user/login/";
const LOGOUT_URL = "/api/user/logout/";

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

export const logout = async (navigate = null) => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const res = await API.post(LOGOUT_URL, { refresh: refreshToken });
      console.log('Logout API response:', res);
    }
  } catch (error) {
    console.error('Error calling logout API:', error);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear local storage regardless of API call success
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    
    // Clear axios default headers
    delete API.defaults.headers.common["Authorization"];
    
    console.log('Logout completed');
    
    // Navigate if navigate function is provided
    if (navigate) {
      navigate('/');
    }
  }
};