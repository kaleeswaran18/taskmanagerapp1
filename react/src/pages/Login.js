import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";  // Import context
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const { socketCon, setUser } = useAppContext();  // Get setUser method from context

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");  // State to store error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form validation function
  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError("Both username and password are required.");
      return false;
    }
    setError(""); // Clear error if form is valid
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data before submitting
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      sessionStorage.clear();

      const response = await axios.post("http://localhost:7000/users/login", formData);
      // Store the user data in context
      setUser(response.data.data);  // Store user data in the context

      // Optionally store the user data in localStorage for persistence across page reloads
      socketCon.emit('authenticate', {
        userId: response.data.data?._id,
        token: response.data.data?.token
      });

      sessionStorage.setItem("user", JSON.stringify(response.data.data));

      // Redirect to home after successful login
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your username and password.");  // Set error message if login fails
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            className="form-input"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        {/* Display error message if validation fails */}
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="submit-button">Login</button>
      </form>

      {/* Link to the Sign Up page */}
      <div className="signup-link">
        <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;
