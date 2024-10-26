import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase.js';
import { useAuth } from '../firebase/AuthContext.js';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import FocusSession from './FocusSession';
import recordingStartedAudio from './assets/recording_started.wav';
import './HomePage.css';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [sessionActive, setSessionActive] = useState(false);
  const [recentStats, setRecentStats] = useState(null);

  // Array of daily focus tips
  const focusTips = [
    "Minimize distractions by silencing notifications during study sessions.",
    "Take regular short breaks to maintain focus for longer periods.",
    "Stay hydrated during your study sessions to improve concentration.",
    "Create a dedicated workspace that's free from distractions.",
    "Use the Pomodoro technique: 25 minutes of focused work, followed by a 5-minute break.",
    "Set specific goals for each session to keep yourself motivated.",
    "Use background music or white noise to block out distractions.",
    "Get enough sleep to help your brain stay sharp during study time.",
    "Avoid multitasking, as it can reduce your focus and productivity.",
    "Reward yourself after a productive study session to stay motivated."
  ];

  useEffect(() => {
    const fetchRecentSession = async () => {
      if (!currentUser) {
        // Handle unauthenticated state
        return;
      }

      const idToken = await currentUser.getIdToken();

      try {
        const response = await fetch('/api/sessions/latest', {
          headers: {
            'Authorization': idToken,
          },
        });
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
  }, [currentUser]);

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

  const handleButtonClick = () => {
    if (!sessionActive) {
      // "Recording started" audio
      const recordingStarted = new Audio(recordingStartedAudio);
      recordingStarted.play();
      setSessionActive(true);
    }
  };

  const getDailyFocusTip = () => {
    const dayOfMonth = new Date().getDate();
    const tipIndex = dayOfMonth % focusTips.length;
    return focusTips[tipIndex];
  };

  const navigate = useNavigate();

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
    <div className="home-container">
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
      <main className="home-main">
        <h1 className="welcome-message">Welcome, {currentUser.email}</h1>
        <div className="home-content">
          {!sessionActive && (
            <button className="session start" onClick={handleButtonClick}>
              <img src="/circle-play.svg" alt="Icon" />
              <span>Start session</span>
            </button>
          )}

          {sessionActive && <FocusSession setSessionActive={setSessionActive} />}

          <div className="recent-stats">
            <p className="content-header"><b>Recent Focus Stats:</b></p>
            {recentStats ? (
              <>
                <p><b>Total Session Time:</b> {formatTime(recentStats.totalSessionTime)}</p>
                <p><b>Total Focused Time:</b> {formatTime(recentStats.totalTimeFocused)}</p>
                <p><b>Number of Alerts:</b> {recentStats.numberOfAlerts}</p>
                <p><b>Focus Percent:</b> {`${recentStats.focusPercent.toFixed(2)}%`}</p>
                {recentStats.totalSessionTime !== 0 && recentStats.numberOfAlerts !== 0 && (
                  <p><b>Focus Lost Every:</b> {formatTime(Math.floor(recentStats.totalSessionTime / recentStats.numberOfAlerts))}</p>
                )}
              </>
            ) : (
              <p>No session has been recorded yet.</p>
            )}
          </div>
        </div>

        <div className="focus-tip">
          <p className="focus-tip-heading"><b>daily focus tip!</b></p>
          <p>{getDailyFocusTip()}</p>
        </div>
      </main>
      <footer>
        <p>
          Designed & <span role="img" aria-label="Coded">👨‍💻</span> by Michael Lambo
        </p>
      </footer>
    </div>
  );
};

export default HomePage;