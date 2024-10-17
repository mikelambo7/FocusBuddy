import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import './DashboardPage.css';

const DashboardPage = () => {
  const [chartType, setChartType] = useState('line'); // State to manage the active chart type
  const [sessions, setSessions] = useState([]); // State to hold session data
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalSessionTime: 0,
    totalFocusTime: 0,
    totalAlerts: 0,
    averageFocusPercentage: 0,
    averageFocusTime: 0,
  });
  const recentSessions = sessions.slice(-10).reverse(); // Get the last 10 sessions, if there are fewer, show all


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions); // Set the fetched session data
          setSummaryData({
            totalSessionTime: data.totalSessionTime,
            totalFocusTime: data.totalFocusTime,
            totalAlerts: data.totalAlerts,
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
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
      });
      if (response.ok) {
        setSessions([]); // Clear the session state if successful
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

  return (
    <div className="dashboard-container">
      <section className="summary-section">
        <h1>Account Summary</h1>
        <div className="section-content">
          <p><b>Overall Session Time:</b> {formatTime(summaryData.totalSessionTime)}</p>
          <p><b>Overall Focus Time:</b> {formatTime(summaryData.totalFocusTime)}</p>
          <p><b>Overall Number of Alerts triggered:</b> {summaryData.totalAlerts}</p>
          <p><b>Average Focus Percentage:</b> {`${summaryData.averageFocusPercentage.toFixed(2)}%`}</p>
          {summaryData.averageFocusTime !== 0 && (
            <p><b>You Lose Focus Every:</b> {formatTime(summaryData.averageFocusTime)}</p>
          )}
        </div>
      </section>

      <section className="data-visualization">
        <h1>Data Visualization</h1>
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
          <div className="chart">
            <Dashboard chartType={chartType} />
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
    </div >
  );
};

export default DashboardPage;
