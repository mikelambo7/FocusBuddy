// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Asynchronously signs in using an email and password.
import './Auth.css'; // Import the shared CSS
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const style = {
    backgroundImage: `url('/fb_landing.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    const handleLogin = (e) => {
        // Prevent the form from submitting and reloading the page
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
        <div className="login-page" style={style}>
            <div className="overlay">
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
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={togglePasswordVisibility}
                                    role="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        <button type="submit" className="login-button">Login</button>
                    </form>
                    <p className="signup-link">
                        Don't have an account? <a href="/signup">Sign up here</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
