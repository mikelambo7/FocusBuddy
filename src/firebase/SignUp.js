import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './Auth.css'; // Import the shared CSS
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [passwordValidity, setPasswordValidity] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        digit: false,
        specialChar: false,
    });
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    // Password validation
    const validatePassword = (password) => {
        const minLength = 8;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const digitRegex = /\d/;

        setPasswordValidity({
            length: password.length >= minLength,
            uppercase: uppercaseRegex.test(password),
            lowercase: lowercaseRegex.test(password),
            digit: digitRegex.test(password),
            specialChar: specialCharRegex.test(password),
        });

        // Check if all requirements are met
        const allValid =
            password.length >= minLength &&
            uppercaseRegex.test(password) &&
            lowercaseRegex.test(password) &&
            digitRegex.test(password) &&
            specialCharRegex.test(password);

        if (!allValid) {
            return 'Password does not meet all requirements.';
        }
        return '';
    };

    const handleSignup = (e) => {
        // Prevent the form from submitting and reloading the page
        e.preventDefault();

        // Validate password before creating account
        const validationError = validatePassword(password);
        if (validationError) {
            setPasswordError(validationError);
            return;
        } else {
            setPasswordError('');
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate('/home');
            })
            .catch((error) => {
                setError('Failed to create an account.');
                console.error('Sign-up error:', error);
            });
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    return (
        <div className="signup-page">
            <div className="overlay">
                <div className="signup-card">
                    <h2>Sign Up</h2>
                    {error && <p className="signup-error">{error}</p>}
                    <form onSubmit={handleSignup}>
                        <div className="input-group-signup">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group-signup">
                            <label>Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        validatePassword(e.target.value);
                                    }}
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
                            {passwordError && (
                                <p className="password-error">{passwordError}</p>
                            )}
                            <ul className="password-requirements">
                                <li className={passwordValidity.length ? 'valid' : 'invalid'}>
                                    Password must be at least 8 characters long.
                                </li>
                                <li className={passwordValidity.uppercase ? 'valid' : 'invalid'}>
                                    Include at least one uppercase letter.
                                </li>
                                <li className={passwordValidity.lowercase ? 'valid' : 'invalid'}>
                                    Include at least one lowercase letter.
                                </li>
                                <li className={passwordValidity.digit ? 'valid' : 'invalid'}>
                                    Include at least one digit.
                                </li>
                                <li className={passwordValidity.specialChar ? 'valid' : 'invalid'}>
                                    Include at least one special character.
                                </li>
                            </ul>
                        </div>
                        <button type="submit" className="signup-button">Sign Up</button>
                    </form>
                    <p className="login-link">
                        Already have an account? <a href="/login">Login here</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
