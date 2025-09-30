import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserRole } from '../services/authutils';

const RoleRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is on the home page and has a token
    if (location.pathname === '/' || location.pathname === '/home') {
      const token = localStorage.getItem('access_token');
      if (token) {
        const role = getUserRole();
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "user") {
          navigate("/profile");
        }
      }
    }
  }, [navigate, location.pathname]);

  return null; // This component doesn't render anything
};

export default RoleRedirect;
