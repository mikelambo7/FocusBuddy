import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const toggleHowItWorks = () => {
    setShowHowItWorks(!showHowItWorks);
  };

  return (
    <div className="landing-page">
      <div className="overlay">
        <h1 className="title-landing">
            <img src="/fb_logo_hd.png" alt="Focus Buddy Logo" className="logo-landing" />
            Focus Buddy !
        </h1>

        <div className="landing-content">
          <h2>Stay Focused, Stay Productive</h2>
          <p className="landing-content-text">
            Focus Buddy helps you maintain concentration by monitoring your focus and providing timely reminders.
          </p>
          <p className="landing-content-text">
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

          <div className="how-it-works-toggle" onClick={toggleHowItWorks}>
            <p>{showHowItWorks ? "Hide How It Works ▲" : "How It Works ▼"}</p>
          </div>

          {showHowItWorks && (
            <div className="how-it-works">
              <ul>
                <li>Sign up and create an account.</li>
                <li>Start a session to begin monitoring.</li>
                <li>You may leave the app running in the background while you focus on your tasks.</li>
                <li>Stay focused as the app tracks your attention.</li>
                <li>The app will notify you with a sound/notification if it detects that you've looked away for too long.</li>
                <li>End a session and review your focus patterns in the dashboard.</li>
              </ul>
            </div>
          )}
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
