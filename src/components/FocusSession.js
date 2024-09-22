import React, { useCallback, useEffect, useState } from 'react';
import WebcamFeed from './WebcamFeed';
import './HomePage.css';

const FocusSession = ({ setSessionActive }) => {
  const [startTime, setStartTime] = useState(null); // Initialize startTime state to store timme a session starts
  const [attentionData, setAttentionData] = useState([]); // Initialize array to store attention metrics for a session
  const [noFaceTime, setNoFaceTime] = useState(0); // Time without face detection
  const [focusLostCount, setFocusLostCount] = useState(0); // Counter for each time user loses focus
  const [totalUnfocusedTime, setTotalUnfocusedTime] = useState(0); // Cumulative unfocused time in seconds/minutes/hours
  const [sessionStats, setSessionStats] = useState(null);
  const [showNotification, setShowNotification] = useState(false); // Notification displayed for when a session is saved successfully



  /* To process whether a face has been detected by the webcam */
  const handleFaceDetected = useCallback((isDetected) => { // useCallback ensures function is memoized and not recreated on every render
    if (!isDetected) {
      setNoFaceTime(prevTime => prevTime + 1); // Increment noFaceTime by 1 second
    } else {
      setNoFaceTime(0); // Reset noFaceTime when face is detected
    }
  }, []);

  useEffect(() => {
    // Check every second if no face is detected for more than 3 seconds
    const interval = setInterval(() => {
      if (noFaceTime > 3) {
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
      totalFocusedTime: Math.floor((new Date() - startTime) / 1000) - totalUnfocusedTime, // in seconds
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

  return (
    <div className="focus-session-container">
      <button className="session end" onClick={endSession}>
        <img src="/circle-stop.svg" alt="Icon" />
        <span>End session</span>
      </button>
      {/* <div className="webcam-feed">
        <WebcamFeed onFaceDetected={handleFaceDetected} />
      </div> */}
      {/* {alert &&
        <div className="alert-container">
          <div className='alert-header'>Stay focused!</div>
          <div className='alert'>Are you still there?</div>
        </div>} */}

      {showNotification && (
        <div className="notification-bar">
          Session saved successfully!
        </div>
      )}

      {sessionStats && (
        <div className="session-stats-container">
          <div className="session-stats">
            <h2>Session Stats</h2>
            <p>Total Session Time: 30 seconds</p>
            <p>Time Focused: 20 seconds</p>
            <p>Total Times Focus Lost: 6 times</p>
            <button onClick={() => setSessionStats(null)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusSession;
