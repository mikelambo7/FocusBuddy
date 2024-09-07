import React, { useState } from 'react';
import FocusSession from './FocusSession';
import './HomePage.css';

const HomePage = () => {
  const [sessionActive, setSessionActive] = useState(false);

  const handleButtonClick = () => {
    if (!sessionActive) {
      setSessionActive(true);
    }
  };

  return (
    <div className="home-container">
      <main>
        <div className="home-content">
          {!sessionActive && (
            <button className="session start" onClick={handleButtonClick}>
              <img src="/circle-play.svg" alt="Icon" />
              <span>Start session</span>
            </button>
          )}
          
          {sessionActive && <FocusSession setSessionActive={setSessionActive} />}

          <div className="recent-stats">
            <p className="content-header">Recent Focus Stats:</p>
            <p>Total Focused Time: 120 mins</p>
            <p>Number of Alerts: 3</p>
            <p>Focus lost every: 40 mins</p>
          </div>
        </div>

        <div className="focus-tip">
          <p className="focus-tip-heading">daily focus tip!</p>
          <p>Minimize distractions by silencing notifications during study sessions</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;