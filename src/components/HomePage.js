import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header>
        <h1 className="title">Focus Buddy</h1>
      </header>

      <nav>
        <button class="tab active">home</button>
        <button class="tab">dashboard</button>
      </nav>
      
      <main>
        <div className="session-controls">
          <button class="session start">Start session</button>
          <button class="session end">End session</button>
        </div>
        <div className="home-content">
            <div className="status">
                <p className="content-header">Current Focus Status:</p>
                <p className="focus-status">Focused</p>
            </div>
            <div className="recent-stats">
                <p className="content-header">Recent Focus Stats:</p>
                <p>Total Focused Time: 120 mins</p>
                <p>Number of Alerts: 3</p>
            </div>
        </div>
      </main>

      <footer>
        <p>Designed & <span role="img" aria-label="developer">👨‍💻</span> by Michael Lambo</p>
      </footer>
    </div>
  );
};

export default HomePage;