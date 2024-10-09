import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import './DashboardPage.css';

const DashboardPage = () => {
  const [chartType, setChartType] = useState('line'); // State to manage the active chart type
  const [sessions, setSessions] = useState([]); // State to hold session data
  const [summaryData, setSummaryData] = useState({
    totalSessionTime: 0,
    totalFocusTime: 0,
    totalAlerts: 0,
    averageFocusPercentage: 0,
    averageFocusTime: 0,
  });
  const recentSessions = sessions.slice(-10); // Get the last 10 sessions, if there are fewer, show all


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
            averageFocusTime: data.totalSessionTime !== 0 && data.totalAlerts !== 0 ? (data.totalSessionTime / data.totalAlerts) : 0,
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  return (
    <div className="dashboard-container">
      <section className="summary-section">
        <h1>Summary</h1>
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
                <th><b>Session End</b></th>
                <th><b>Focus Duration</b></th>
                <th><b>Alerts Triggered</b></th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session, index) => (
                <tr key={index}>
                  <td>{new Date(session.startTime).toLocaleTimeString()}</td>
                  <td>{new Date(session.endTime).toLocaleTimeString()}</td>
                  <td>{formatTime(session.totalTimeFocused)}</td>
                  <td>{session.numberOfAlerts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='no-session-text'>No session recorded</p> // Show this message if no sessions are available
        )}
      </section>
    </div >
  );
};

export default DashboardPage;
