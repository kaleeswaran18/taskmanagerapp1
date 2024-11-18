import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './login.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'User', 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:7000/users/register', formData);

     
      toast.success(response.data.message);

     
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error'); 
    }
  };

  return (
    <div className="register-container">
      <ToastContainer /> {/* Toast notification container */}
      <h2 className="register-title">Register</h2>
      <form className="register-form" onSubmit={handleSubmit}>
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
        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
      <p className="login-prompt">
        Already signed up? <Link to="/login" className="login-link">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
