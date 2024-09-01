import React, { useState } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [sessionActive, setSessionActive] = useState(false);

  const handleButtonClick = () => {
    setSessionActive(!sessionActive);
  };

  return (
    <div className="home-container">
      <main>
        <div className="home-content">
          <button
            className={`session ${sessionActive ? 'end' : 'start'}`}
            onClick={handleButtonClick}
          >
            <img src={`${sessionActive ? '/circle-stop.svg' : '/circle-play.svg'}`} alt="Icon" />
            <span>{sessionActive ? 'End session' : 'Start session'}</span>
          </button>
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