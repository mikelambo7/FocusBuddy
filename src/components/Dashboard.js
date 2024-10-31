import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase.js';
import { Chart, registerables } from 'chart.js';

// Register the necessary components for Chart.js
Chart.register(...registerables);

const Dashboard = ({ chartType, dataType }) => {
  const [data, setData] = useState([]);

  // Generate data for 10 most recent sessions
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
            'Authorization': idToken,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const sessions = data.sessions;
          const recentSessions = sessions.slice(-10);

          const formattedData = recentSessions.map((session) => ({
            startTime: session.startTime,
            focusPercent: session.focusPercent,
            numberOfAlerts: session.numberOfAlerts,
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

    const backgroundColor = chartType === 'pie'
      ? [
          '#4BC0C0', // cyan
          '#3357FF', // blue
          '#FF5733', // red-orange
          '#9D33FF', // purple
          '#FFBD33', // yellow-orange
          '#dfdee6', // light blue
          '#FF6384', // pink-red
          '#056316', // green
          '#1C104C', // dark purple
          '#5c0606', // red
        ]
      : '#0cae73'; 
    const borderColor = chartType === 'pie' ? '#B5C2E4' : '#0cae73'; 

    const chartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        // Specifies the labels for the X-axis.
        labels: data.map((session) => new Date(session.startTime).toLocaleTimeString()),
        // Defines the data series displayed in the chart.
        datasets: [{
          label: dataType === 'focus' ? 'Average Focus Percentage' : 'Alerts Triggered per Session',
          data: dataType === 'focus' 
            ? data.map((session) => session.focusPercent) // Calculates average focus time for each session
            : data.map((session) => session.numberOfAlerts), // Calculates total number of alerts for each session
          fill: false,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          pointBackgroundColor: '#1C104C',
        }],
      },
      options: {
        responsive: true,
        plugins: { // Ensures that the legend (which shows the dataset label) is visible.
          legend: {
            display: true,
            labels: {
              color: '#333',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1C104C',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4bc0c0',
            borderWidth: 1,
          },
        },
        scales: {
          x: { // Configures the X-axis
            title: {
              display: true,
              text: 'Time',
              color: '#1C104C',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
            ticks: {
              color: '#333', // X-axis tick color
            },
            grid: {
              display: false, // Hide vertical gridlines for a cleaner look
            },
          },
          y: { // Configures the Y-axis
            title: {
              display: true,
              text: dataType === 'focus' ? 'Focus Percentage (%)' : 'Alerts Count',
              color: '#1C104C',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
            ticks: {
              color: '#333',
            },
            grid: {
              color: 'rgba(75, 192, 192, 0.1)', // Subtle gridlines for visual aid
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => chartInstance.destroy(); // Cleanup to avoid memory leaks
  }, [data, chartType, dataType]);

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