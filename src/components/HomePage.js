import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <main>
        <div className="session-controls">
          <button class="session start">Start session</button>
          <button class="session end">End session</button>
        </div>
        <div className="home-content">
            <div className="recent-stats">
                <p className="content-header">Recent Focus Stats:</p>
                <p>Total Focused Time: 120 mins</p>
                <p>Number of Alerts: 3</p>
            </div>
            <div className="focus-tip">
                <p className="focus-tip-heading">daily focus tip!</p>
                <p>Minimize distractions by silencing notifications during study sessions</p>
            </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;