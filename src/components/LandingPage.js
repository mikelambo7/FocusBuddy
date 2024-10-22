import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="overlay">
        <h1 className="title-landing">
            <img src="/fb_logo_hd.png" alt="Focus Buddy Logo" className="logo-landing" />
            Focus Buddy !
        </h1>

        <div className="landing-content">
          <h2>Stay Focused, Stay Productive</h2>
          <p>
            Focus Buddy helps you maintain concentration by monitoring your focus and providing timely reminders.
          </p>
          <p>
            Start a session and begin monitoring your attention spans and focus patterns.
          </p>

          <div className="landing-buttons">
            <Link to="/signup" className="landing-button signup">
              <b>Sign Up</b>
            </Link>
            <Link to="/login" className="landing-button login">
              <b>Login</b>
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
