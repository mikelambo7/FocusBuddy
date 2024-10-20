// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Asynchronously signs in using an email and password.
import './Auth.css'; // Import the shared CSS

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate('/home');
            })
            .catch((error) => {
                setError('Invalid email or password.');
                console.error('Login error:', error);
            });
    };

    return (
        <div className="login-page">
          <div className="login-card">
            <h2>Login</h2>
            {error && <p className="login-error">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="input-group-login">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group-login">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button">Login</button>
            </form>
            <p className="signup-link">
              Don't have an account? <a href="/signup">Sign up here</a>.
            </p>
          </div>
        </div>
      );
};

export default Login;
