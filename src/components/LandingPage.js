import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="overlay">
        <header className="landing-header">
          <h1 className="landing-title">
            <img src="/fb_logo_hd.png" alt="Focus Buddy Logo" className="landing-logo" />
            Focus Buddy
          </h1>
        </header>

        <div className="landing-content">
          <h2>Stay Focused, Stay Productive</h2>
          <p>
            Focus Buddy helps you maintain concentration by monitoring your focus and providing timely reminders.
          </p>

          <div className="landing-buttons">
            <Link to="/signup" className="landing-button signup-button">
              Sign Up
            </Link>
            <Link to="/login" className="landing-button login-button">
              Login
            </Link>
          </div>
        </div>

        <footer className="landing-footer">
          <p>
            Designed & <span role="img" aria-label="Coded">👨‍💻</span> by Michael Lambo
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
