import React, { useState, useEffect } from 'react';
import FocusSession from './FocusSession';
import recordingStartedAudio from './assets/recording_started.wav';
import './HomePage.css';

const HomePage = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [recentStats, setRecentStats] = useState(null);

  useEffect(() => {
    const fetchRecentSession = async () => {
      try {
        const response = await fetch('/api/sessions/latest');
        if (response.ok) {
          const data = await response.json();
          setRecentStats(data);
        } else {
          console.error('Failed to fetch latest session');
        }
      } catch (error) {
        console.error('Error fetching recent session:', error);
      }
    };

    fetchRecentSession();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const handleButtonClick = () => {
    if (!sessionActive) {
      // "Recording started" audio
      const recordingStarted = new Audio(recordingStartedAudio);
      recordingStarted.play();
      setSessionActive(true);
    }
  };

  return (
    <div className="home-container">
      <main>
        <div className="home-content">
          {!sessionActive && (
            <button className="session start" onClick={handleButtonClick}>
              <img src="/circle-play.svg" alt="Icon" />
              <span>Start session</span>
            </button>
          )}

          {sessionActive && <FocusSession setSessionActive={setSessionActive} />}

          <div className="recent-stats">
            <p className="content-header">Recent Focus Stats:</p>
            {recentStats ? (
              <>
                <p>Total Session Time: {formatTime(recentStats.totalSessionTime)}</p>
                <p>Total Focused Time: {formatTime(recentStats.totalTimeFocused)}</p>
                <p>Number of Alerts: {recentStats.numberOfAlerts}</p>
                {recentStats.totalSessionTime !== 0 && recentStats.numberOfAlerts !== 0 && (
                  <p>Focus lost every: {formatTime(recentStats.totalSessionTime / recentStats.numberOfAlerts)}</p>
                )}
              </>
            ) : (
              <p>No session has been recorded yet.</p>
            )}
          </div>
        </div>

        <div className="focus-tip">
          <p className="focus-tip-heading">daily focus tip!</p>
          <p>Minimize distractions by silencing notifications during study sessions</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;