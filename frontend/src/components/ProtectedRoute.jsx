import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../services/authutils';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('access_token');
  const userRole = getUserRole();

  // If no token, redirect to home
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If role is required and user doesn't have it, redirect to home
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and has required role (or no role required), render children
  return children;
};

export default ProtectedRoute;
