import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
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
    try {
      const res = await login(credentials);
      navigate('/');
      return res;
    } catch (err) {
      setError(err?.response?.data || 'Login failed');
      console.error('Login error:', err);
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
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors duration-200"
            />
          </div>
          <div className="mb-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl border border-neutral-900 bg-neutral-900 text-white py-3 px-8 text-sm uppercase transition-colors duration-200 hover:bg-neutral-800"
          >
            Log In
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
