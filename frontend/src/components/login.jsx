import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';
import { getUserRole } from '../services/authutils';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // show message passed from signup
    const msg = location.state?.infoMessage;
    if (msg) {
      setInfoMessage(msg);
      // optionally clear history state so refresh doesn't keep message
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) =>
    setCredentials((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log('Attempting login with credentials:', credentials);
    try {
      const res = await login(credentials);
      console.log('Login response:', res);
      
      // Small delay to ensure tokens are stored
      setTimeout(() => {
        // Check if there's a return URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo');
        
        if (returnTo) {
          // Redirect back to the original page
          console.log('Redirecting back to:', returnTo);
          navigate(returnTo);
        } else {
          // Redirect based on user role after successful login
          const role = getUserRole();
          console.log('User role:', role);
          if (role === "admin") {
            navigate("/admin");
          } else if (role === "user") {
            navigate("/profile");
          } else {
            // Fallback to home page if role is not determined
            console.log('No role found, redirecting to home');
            navigate("/");
          }
        }
      }, 100);
      
      return res;
    } catch (err) {
      console.error('Login error details:', err);
      console.error('Error response:', err?.response);
      console.error('Error message:', err?.message);
      
      // Better error handling
      if (err?.response?.data) {
        setError(err.response.data);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex items-center justify-center py-12">
      <div className="w-full max-w-sm mx-auto p-8 rounded-xl bg-white shadow-lg">
        <h1 className="text-3xl font-extralight tracking-widest text-center uppercase mb-2">
          Log In
        </h1>
        <p className="text-center text-sm mb-8 text-neutral-500">
          Welcome back to your account.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              name="username"
              type="text"
              placeholder="username"
              value={credentials.username}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors duration-200 ${
                isLoading 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'bg-white border-neutral-300 focus:border-neutral-500'
              }`}
            />
          </div>
          <div className="mb-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors duration-200 ${
                isLoading 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'bg-white border-neutral-300 focus:border-neutral-500'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-xl border border-neutral-900 py-3 px-8 text-sm uppercase transition-colors duration-200 ${
              isLoading 
                ? 'bg-neutral-500 cursor-not-allowed' 
                : 'bg-neutral-900 hover:bg-neutral-800'
            } text-white`}
          >
            {isLoading ? 'Signing In...' : 'Log In'}
          </button>
        </form>
        {infoMessage && <p style={{ color: 'green' }}>{infoMessage}</p>}
        <div className="text-center mt-6">
          <a
            href="#"
            className="text-neutral-500 hover:text-neutral-900 text-sm font-light uppercase tracking-wider"
          >
            Forgot your password?
          </a>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-neutral-500 font-light">
            Don't have an account?{' '}
            <NavLink
              to="/signup"
              className="text-neutral-900 font-normal hover:text-neutral-500 transition-colors duration-200"
            >
              Sign up
            </NavLink>
          </p>
        </div>
        {error && (
          <p style={{ color: 'red' }}>
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
