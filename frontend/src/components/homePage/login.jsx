import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Background from '../features/Background';
import { connectSocket } from '../../socket.js';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', formData);

      if (response.status === 200) {
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('token', response.data.token);
       await connectSocket();
        console.log('Login successful, token:', response.data.token);

        

        navigate('/room');
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <>
      <Background />
      <div className="login-whole">
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div className="input-box">
              <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-box">
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn">LOGIN</button>
            <div className="register-link">
              <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
