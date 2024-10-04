import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

// Register the necessary components for Chart.js
Chart.register(...registerables);

const Dashboard = ({ chartType }) => {
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   // Hardcoded data for testing purposes
  //   const testData = [
  //     { startTime: '2024-09-24T10:00:00Z', focusPercent: 43 },
  //     { startTime: '2024-09-24T10:30:00Z', focusPercent: 67 },
  //     { startTime: '2024-09-24T11:00:00Z', focusPercent: 51 },
  //     { startTime: '2024-09-24T11:30:00Z', focusPercent: 48 },
  //     { startTime: '2024-09-24T12:00:00Z', focusPercent: 78 },
  //     { startTime: '2024-09-24T12:30:00Z', focusPercent: 85 },
  //     { startTime: '2024-09-24T13:00:00Z', focusPercent: 56 },
  //     { startTime: '2024-09-24T13:30:00Z', focusPercent: 64 },
  //     { startTime: '2024-09-24T14:00:00Z', focusPercent: 90 }, 
  //     { startTime: '2024-09-24T14:30:00Z', focusPercent: 72 },
  //   ];
  //   setData(testData);
  // }, []); // Only run once on component mount

  // Generate data for 10 most recent sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const data = await response.json();
          const sessions = data.sessions;
          const recentSessions = sessions.slice(-10);

          const formattedData = recentSessions.map((session) => ({
            startTime: session.startTime,
            focusPercent: session.focusPercent,
          }));

          setData(formattedData);
        } else {
          console.error('Failed to fetch sessions');
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    if (data.length === 0) return; // Prevents chart rendering if no data is available

    //  Fetches the 2D rendering context required by Chart.js to draw on the canvas
    const ctx = document.getElementById('attentionChart').getContext('2d');

    const chartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        // Specifies the labels for the X-axis.
        labels: data.map((session) => new Date(session.startTime).toLocaleTimeString()),
        // Defines the data series displayed in the chart.
        datasets: [{
          label: 'Attention Over Time',
          data: data.map((session) => session.focusPercent), // Calculates average focus time for each session
          fill: false,
        }],
      },
      options: {
        responsive: true,
        plugins: { // Ensures that the legend (which shows the dataset label) is visible.
          legend: {
            display: true,
          },
        },
        scales: {
          x: { // Configures the X-axis
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: { // Configures the Y-axis
            title: {
              display: true,
              text: 'Average Focus Percentage (%)',
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => chartInstance.destroy(); // Cleanup to avoid memory leaks
  }, [data, chartType]);

  return (
    <>
      {data.length === 0 ? (
        <p className='chart-text'><b>No data to visualize..</b></p>
      ) : (
        <canvas id="attentionChart" />
      )}
    </>
  );
};

export default Dashboard;