import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase.js';
import { signOut } from 'firebase/auth';
import Dashboard from './Dashboard';
import './DashboardPage.css';

const DashboardPage = () => {
  const [chartType, setChartType] = useState('line'); // State to manage the active chart type
  const [dataType, setDataType] = useState('focus'); // State to toggle between focus and alerts chart data
  const [sessions, setSessions] = useState([]); // State to hold session data
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalSessionTime: 0,
    totalFocusTime: 0,
    averageAlerts: 0,
    averageFocusPercentage: 0,
    averageFocusTime: 0,
  });
  const recentSessions = sessions.slice(-10).reverse(); // Get the last 10 sessions, if there are fewer, show all

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const user = auth.currentUser;
      if (!user) {
        // Handle unauthenticated state
        return;
      }

      const idToken = await user.getIdToken();

      try {
        const response = await fetch('/api/sessions', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          setSessions(data.sessions); // Set the fetched session data
          setSummaryData({
            totalSessionTime: data.totalSessionTime,
            totalFocusTime: data.totalFocusTime,
            averageAlerts: data.averageAlerts,
            averageFocusPercentage: data.averageFocusPercentage,
            averageFocusTime: data.totalSessionTime !== 0 && data.totalAlerts !== 0 ? (Math.floor(data.totalSessionTime / data.totalAlerts)) : 0,
          });
        } else {
          console.error('Failed to fetch sessions');
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  // Function to clear session history
  const clearHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      // Handle unauthenticated state
      return;
    }

    const idToken = await user.getIdToken();

    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        setSessions([]);
        setConfirmClearHistory(false);
      } else {
        console.error('Failed to clear session history');
      }
    } catch (error) {
      console.error('Error clearing session history:', error);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs} hr ${mins} min ${secs} sec`;
    } else if (mins > 0) {
      return `${mins} min ${secs} sec`;
    } else {
      return secs === 1 ? `${secs} second` : `${secs} seconds`;
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1 className="title">
          <img src="/fb_logo_hd.png" alt="Focus Buddy Logo" className="logo" />
          Focus Buddy!
        </h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <nav>
        <NavLink to="/home" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
      </nav>

      <main className="dashboard-main">
        <section className="summary-section">
          <h1>Account Summary</h1>
          <div className="section-content">
            <div className="data-item">
              <p><b>Overall Session Time:</b></p>
              <p>{formatTime(summaryData.totalSessionTime)}</p>
            </div>
            <div className="data-item">
              <p><b>Overall Focus Time:</b></p>
              <p>{formatTime(summaryData.totalFocusTime)}</p>
            </div>
            <div className="data-item">
              <p><b>Average Number of Alerts per Session:</b></p>
              <p>{summaryData.averageAlerts.toFixed(2)}</p>
            </div>
            <div className="data-item">
              <p><b>Average Focus Percentage:</b></p>
              <p>{`${summaryData.averageFocusPercentage.toFixed(2)}%`}</p>
            </div>
            {summaryData.averageFocusTime !== 0 && (
              <div className="data-item">
                <p><b>You Lose Focus Every:</b></p>
                <p>{formatTime(summaryData.averageFocusTime)}</p>
              </div>
            )}
          </div>
        </section>

        <section className="data-visualization">
          <h1>Data Visualization</h1>
          <div className="data-visualization-content">
            <div className="data-visualization-toggle">
              <p>Select Data to Display:</p>
              <button
                onClick={() => setDataType('focus')}
                className={dataType === 'focus' ? 'active' : ''}
              >
                Focus Level
              </button>
              <button
                onClick={() => setDataType('alerts')}
                className={dataType === 'alerts' ? 'active' : ''}
              >
                Alerts Triggered
              </button>
            </div>

            <div className="divider-line"></div>

            <div className="chart-container">
              <div className="chart-toggle">
                <button
                  className={chartType === 'line' ? 'active' : ''}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
                <button
                  className={chartType === 'pie' ? 'active' : ''}
                  onClick={() => setChartType('pie')}
                >
                  Pie
                </button>
                <button
                  className={chartType === 'bar' ? 'active' : ''}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
              </div>
              <div className={`${chartType === 'pie' ? 'pie-chart' : 'chart'}`}>
                <Dashboard chartType={chartType} dataType={dataType} />
              </div>
            </div>
          </div>
        </section >

        <section className="recent-sessions">
          <h1>Recent Sessions</h1>
          {recentSessions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th><b>Session started</b></th>
                  <th><b>Session Duration</b></th>
                  <th><b>Focus Duration</b></th>
                  <th><b>Alerts Triggered</b></th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session, index) => (
                  <tr key={index}>
                    <td>{new Date(session.startTime).toLocaleString()}</td>
                    <td>{formatTime(session.totalSessionTime)}</td>
                    <td>{formatTime(session.totalTimeFocused)}</td>
                    <td>{session.numberOfAlerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : (
            <p className='no-session-text'><b>No session recorded</b></p> // Show this message if no sessions are available
          )}
        </section>

        <div className="clear-history-btn-container">
          <button className="clear-history-btn" onClick={() => setConfirmClearHistory(true)}>
            Clear History
          </button>
        </div>


        {confirmClearHistory && (
          <div className="confirm-clear-history-container">
            <div className="confirm-clear-history">
              <h3>Are you sure you want to clear your session history?</h3>
              <button onClick={() => setConfirmClearHistory(false)}>Cancel</button>
              <button onClick={clearHistory}>Yes, Clear History</button>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>
          Designed & <span role="img" aria-label="Coded">👨‍💻</span> by Michael Lambo
        </p>
      </footer>
    </div >
  );
};

export default DashboardPage;
