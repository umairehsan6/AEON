import React, { useState } from 'react';
import { signup } from "../services/auth";
import { useNavigate } from "react-router-dom";

function renderError(err) {
  if (!err) return null;
  if (Array.isArray(err)) return err.join(" ");
  if (typeof err === "object") return Object.values(err).flat().join(" ");
  return String(err);
}

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setLoading(true);

    try {
      await signup(formData);
      setSuccess(true);
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
      });

      // Redirect to login and pass success message via location state
      navigate("/login", {
        state: { infoMessage: "Your account has been created. Please login." },
      });
    } catch (err) {
      const data = err?.response?.data;
      if (data) {
        setErrors(data);
      } else {
        setErrors({ non_field_errors: ["Something went wrong"] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen font-sans p-8">
        <div className="bg-white p-12 rounded-lg shadow-xl w-full max-w-lg">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light tracking-wide mb-2">Create Account</h1>
            <p className="text-neutral-500 text-sm font-light">Join us to experience the best of our store.</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="first_name"
                  placeholder="First Name"
                  className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-800 transition-all text-neutral-800 placeholder-neutral-500"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && <p className="text-red-600 text-sm mt-1">{renderError(errors.first_name)}</p>}
              </div>
              <div>
                <input
                  name="last_name"
                  placeholder="Last Name"
                  className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-800 transition-all text-neutral-800 placeholder-neutral-500"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && <p className="text-red-600 text-sm mt-1">{renderError(errors.last_name)}</p>}
              </div>
            </div>
            
            <input
              name="username"
              placeholder="Username"
              className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-800 transition-all text-neutral-800 placeholder-neutral-500"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{renderError(errors.username)}</p>}
            
            <input
              name="email"
              type="email"
              placeholder="Email address"
              className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-800 transition-all text-neutral-800 placeholder-neutral-500"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{renderError(errors.email)}</p>}

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-800 transition-all text-neutral-800 placeholder-neutral-500"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{renderError(errors.password)}</p>}
            
            <input
              name="password2"
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-800 transition-all text-neutral-800 placeholder-neutral-500"
              value={formData.password2}
              onChange={handleChange}
            />
            {errors.password2 && <p className="text-red-600 text-sm mt-1">{renderError(errors.password2)}</p>}

            {errors.non_field_errors && (
              <p className="text-red-600 text-sm mt-1 text-center">{renderError(errors.non_field_errors)}</p>
            )}

            <button
              to="/login"
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold rounded-lg transition-all duration-300
                        bg-neutral-800 text-white shadow-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing Up...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Message and Footer */}
          {success && (
            <p className="mt-6 text-center text-sm text-green-700">
              Signup successful!
            </p>
          )}
          <div className="mt-6 text-center text-neutral-500 text-sm">
            <p>Already have an account?</p>
            <a href="#" className="text-neutral-800 font-semibold hover:underline">Sign In</a>
          </div>
        </div>
      </div>
    </>
  );
}
