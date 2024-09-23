import React, { useCallback, useEffect, useState } from 'react';
import WebcamFeed from './WebcamFeed';
import pingSound from './assets/ping_alert.wav';
import './HomePage.css';

const FocusSession = ({ setSessionActive }) => {
  const [startTime, setStartTime] = useState(null); // Initialize startTime state to store timme a session starts
  const [attentionData, setAttentionData] = useState([]); // Initialize array to store attention metrics for a session
  const [noFaceTime, setNoFaceTime] = useState(0); // Time without face detection
  const [focusLostCount, setFocusLostCount] = useState(0); // Counter for each time user loses focus
  const [totalUnfocusedTime, setTotalUnfocusedTime] = useState(0); // Cumulative unfocused time in seconds/minutes/hours
  const [sessionStats, setSessionStats] = useState(null);
  const [showNotification, setShowNotification] = useState(false); // Notification displayed for when a session is saved successfully

  const alertSound = new Audio(pingSound);

  /* To process whether a face has been detected by the webcam */
  const handleFaceDetected = useCallback((isDetected) => { // useCallback ensures function is memoized and not recreated on every render
    if (!isDetected) {
      setNoFaceTime(prevTime => prevTime + 1); // Increment noFaceTime by 1 second
      setTotalUnfocusedTime(prevTime => prevTime + 1) // Increment total unfocused time
    } else {
      setNoFaceTime(0); // Reset noFaceTime when face is detected
    }
  }, []);

  useEffect(() => {
    // Check every second if no face is detected for more than 3 seconds
    const interval = setInterval(() => {
      if (noFaceTime > 0) {
        alertSound.play();
        setFocusLostCount(prevCount => prevCount + 1); // Increment focus lost count if face isn't detected for more than 3 seconds
        setNoFaceTime(0); // Reset noFaceTime after logging the loss of focus
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [noFaceTime]);

  useEffect(() => {
    setStartTime(new Date()); // Set the session's start time as the current time
  }, []);

  const endSession = async () => {
    const sessionData = {
      startTime: new Date(startTime),
      endTime: new Date(),
      attentionSpans: attentionData, // Array of attention metrics
      totalSessionTime: Math.floor((new Date() - startTime) / 1000), // in seconds
      totalTimeUnfocused: totalUnfocusedTime, // in seconds
      totalFocusLost: focusLostCount,
    };

    try {
      // Send the session data to the server
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        // Show the success notification
        setShowNotification(true);

        // Hide the notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);

        // After the notification, show session stats in a modal
        setSessionStats(sessionData);
      } else {
        console.error('Failed to save session data');
      }

      setSessionActive(false);
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  };

  // Formats the times as minutes and seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  // Calculates the percentage of a session the user was unfocused
  const calculateUnfocusedPercentage = (sessionTime, unfocusedTime) => {
    if (sessionTime === 0) return 0; // To avoid division by zero
    return ((unfocusedTime / sessionTime) * 100).toFixed(2);
  };

  return (
    <div className="focus-session-container">
      <button className="session end" onClick={endSession}>
        <img src="/circle-stop.svg" alt="Icon" />
        <span>End session</span>
      </button>
      {/* <div className="webcam-feed">
        <WebcamFeed onFaceDetected={handleFaceDetected} />
      </div> */}

      {showNotification && (
        <div className="notification-bar">
          Session saved successfully!
        </div>
      )}

      {sessionStats && (
        <div className="session-stats-container">
          <div className="session-stats">
            <h2>Session Stats</h2>
            <p>Total Session Time: {formatTime(sessionStats.totalSessionTime)}</p>
            <p>Time Focused: {formatTime(sessionStats.totalSessionTime - sessionStats.totalTimeUnfocused)}</p>
            <p>Total Times Focus Lost: {formatTime(sessionStats.totalFocusLost)}</p>

            <p>You were unfocused for a total of {calculateUnfocusedPercentage(sessionStats.totalSessionTime, sessionStats.totalTimeUnfocused)}% of your session</p>
            <button onClick={() => setSessionStats(null)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusSession;
