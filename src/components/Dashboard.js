import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

// Register the necessary components for Chart.js
Chart.register(...registerables);

const Dashboard = ({ chartType }) => {
  const [data, setData] = useState([]);

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

    const backgroundColor = chartType === 'pie'
      ? [
          '#4BC0C0',
          '#3357FF',
          '#FF5733',
          '#9D33FF',
          '#FFBD33',
          '#33FFF6',
          '#FF6384',
          '#33FF57',
          '#1C104C',
          '#FF33A1',
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
          label: 'Average Focus Percentage',
          data: data.map((session) => session.focusPercent), // Calculates average focus time for each session
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
              text: 'Average Focus Percentage (%)',
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