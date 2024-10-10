import React, { useCallback, useEffect, useState, useRef } from 'react';
import WebcamFeed from './WebcamFeed';
import pingSound from './assets/ping_alert.wav';
import './HomePage.css';

const FocusSession = ({ setSessionActive }) => {
  const [startTime, setStartTime] = useState(null); // Initialize startTime state to store timme a session starts
  const [noFaceTime, setNoFaceTime] = useState(0); // Time without face detection
  const [alertsTriggered, setAlertsTriggered] = useState(0); // Counter for each time user loses focus
  const [totalUnfocusedTime, setTotalUnfocusedTime] = useState(0); // Cumulative unfocused time in seconds/minutes/hours
  const [sessionStats, setSessionStats] = useState(null);
  const [showNotification, setShowNotification] = useState(false); // Notification displayed for when a session is saved successfully
  const alertSoundRef = useRef(new Audio(pingSound));
  const noFaceDetectedRef = useRef(false); // Flag to track face detection

  /* To process whether a face has been detected by the webcam */
  const handleFaceDetected = useCallback((isDetected) => { // useCallback ensures function is memoized and not recreated on every render
    noFaceDetectedRef.current = !isDetected; // Store whether the face is detected
  }, []);

  useEffect(() => {
    const alertSound = alertSoundRef.current;
    alertSound.load(); // Preload sound

    // Check every second to see if face is detected
    const interval = setInterval(() => {
      if (noFaceDetectedRef.current) {
        setNoFaceTime((prevTime) => prevTime + 1); // Increment noFaceTime by 1 second
        setTotalUnfocusedTime((prevTime) => prevTime + 1); // Increment unfocused time by 1 second

        // If no face is detected for 3 seconds, trigger alert
        if (noFaceTime === 3) {
          alertSound.play();
          setAlertsTriggered((prevCount) => prevCount + 1); // Increment focus lost count
          setNoFaceTime(0); // Reset noFaceTime after logging the loss of focus
        }
      } else {
        setNoFaceTime(0); // Reset noFaceTime if face is detected
      }
    }, 1000); // Check every second

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [noFaceTime]);

  useEffect(() => {
    setStartTime(new Date()); // Set the session's start time as the current time
  }, []);

  const endSession = async () => {
    const endTime = new Date();

    const sessionData = {
      startTime: new Date(startTime),
      endTime: endTime,
      totalSessionTime: Math.floor((endTime - startTime) / 1000), // in seconds
      totalTimeUnfocused: totalUnfocusedTime, // in seconds
      totalTimeFocused: Math.floor((endTime - startTime) / 1000) - totalUnfocusedTime,
      numberOfAlerts: alertsTriggered,
      focusPercent: ((Math.floor((endTime - startTime) / 1000) - totalUnfocusedTime) / (Math.floor((endTime - startTime) / 1000))) * 100,
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
        }, 2000);

        // After the notification, show session stats in a modal
        setSessionStats(sessionData);
      } else {
        console.error('Failed to save session data');
      }
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

  return (
    <div className="focus-session-container">
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
            <p>Time Focused: {formatTime(sessionStats.totalTimeFocused)}</p>
            <p>Total Alerts Triggered: {sessionStats.numberOfAlerts}</p>

            <p className="session-analysis-text">You were focused for a total of {`${sessionStats.focusPercent.toFixed(2)}%`} of your session</p>
            <button onClick={() => {
              setSessionStats(null);
              setSessionActive(false);
            }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {!sessionStats && (
        <>
          <button className="session end" onClick={endSession}>
            <img src="/circle-stop.svg" alt="Icon" />
            <span>End session</span>
          </button>
          <div className="webcam-feed">
            <WebcamFeed onFaceDetected={handleFaceDetected} />
          </div>
        </>
      )}
    </div>
  );
};

export default FocusSession;
