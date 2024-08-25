import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/sessions');
      const result = await response.json();
      setData(result);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const ctx = document.getElementById('attentionChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((session) => new Date(session.startTime).toLocaleTimeString()),
        datasets: [{
          label: 'Attention Over Time',
          data: data.map((session) => 
          session.attentionSpans.reduce((a, b) => a + b, 0) / session.attentionSpans.length), // Creates an array of data points for the chart. Each data point represents the average attention span for a particular session.
          fill: false,
        }],
      },
    });
  }, [data]);

  return <canvas id="attentionChart"></canvas>;
};

export default Dashboard;