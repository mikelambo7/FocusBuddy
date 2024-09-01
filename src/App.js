import React, { useState } from 'react';
import HomePage from './components/HomePage';
import DashboardPage from './components/DashboardPage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="title">Focus Buddy !</h1>
      </header>

      <nav>
        <button
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
      </nav>

      <main>
        {renderContent()}
      </main>

      <footer className="footer">
        <p>Designed & <span role="img" aria-label="Coded">👨‍💻</span> by Michael Lambo</p>
      </footer>
    </div>
  );
}

export default App;