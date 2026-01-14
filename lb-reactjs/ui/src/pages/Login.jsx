import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    userType: 'passenger' // 'passenger' or 'driver'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignup) {
      // Signup logic
      onLogin({
        name: formData.name,
        username: formData.username,
        userType: formData.userType,
        isAuthenticated: true
      });
    } else {
      // Login logic - for demo purposes, just log in
      onLogin({
        name: formData.name || 'User',
        username: formData.username,
        userType: formData.userType,
        isAuthenticated: true
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="ubby-logo">ubby</h1>
        <p className="ubby-tagline">Your ride, your way</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {isSignup && (
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {isSignup && (
          <div className="form-group user-type-selection">
            <label>I want to be a:</label>
            <div className="user-type-buttons">
              <button
                type="button"
                className={`user-type-btn ${formData.userType === 'passenger' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'passenger' })}
              >
                <span className="icon">🚗</span>
                <span>Passenger</span>
                <p className="type-desc">Request rides</p>
              </button>
              <button
                type="button"
                className={`user-type-btn ${formData.userType === 'driver' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'driver' })}
              >
                <span className="icon">🚙</span>
                <span>Driver</span>
                <p className="type-desc">Earn money driving</p>
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn">
          {isSignup ? 'Sign Up' : 'Log In'}
        </button>

        <div className="toggle-form">
          {isSignup ? (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsSignup(false)}>
                Log In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsSignup(true)}>
                Sign Up
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
