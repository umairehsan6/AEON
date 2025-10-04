import { jwtDecode } from "jwt-decode";

export const getUserRole = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const getUserInfo = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const redirectUserByRole = (navigate) => {
  const role = getUserRole();
  if (!role) return;

  if (role === "admin") {
    navigate("/admin");
  } else if (role === "user") {
    navigate("/profile");
  }
};
