import { useState } from "react";
import { signup } from "../services/auth";

export default function Signup() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

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
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ["Something went wrong"] });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

      <input
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
      />
      {errors.first_name && <p style={{ color: "red" }}>{errors.first_name}</p>}

      <input
        name="last_name"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={handleChange}
      />
      {errors.last_name && <p style={{ color: "red" }}>{errors.last_name}</p>}

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

      <input
        name="password2"
        type="password"
        placeholder="Confirm Password"
        value={formData.password2}
        onChange={handleChange}
      />
      {errors.password2 && <p style={{ color: "red" }}>{errors.password2}</p>}

      {errors.non_field_errors && (
        <p style={{ color: "red" }}>{errors.non_field_errors}</p>
      )}

      <button type="submit">Sign Up</button>

      {success && <p style={{ color: "green" }}>Signup successful!</p>}
    </form>
  );
}
