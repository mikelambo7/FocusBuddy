import React from 'react';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <section className="summary-section">
        <h1>Summary Section</h1>
        <div className="section-content">
            <p>Total Focus Time: [Value]</p>
            <p>Number of Distractions: [Value]</p>
            <p>Average Focus Time: [Value]</p>
        </div>
      </section>
      
      <section className="data-visualization">
        <h1>Data Visualization</h1>
        <div className="chart">Line Chart: Focus Time Over Time</div>
        <div className="chart">Bar Chart: Focus Time Comparison</div>
        <div className="chart">Pie Chart: Focus vs. Distractions</div>
      </section>
      
      <section className="recent-sessions">
        <h1>Recent Sessions</h1>
        <table>
          <thead>
            <tr>
              <th>Session Start</th>
              <th>Session End</th>
              <th>Focus Duration</th>
              <th>Alerts Triggered</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>[Time]</td>
              <td>[Time]</td>
              <td>[Duration]</td>
              <td>[Alerts]</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DashboardPage;
