import React, { useCallback, useEffect, useState } from 'react';
import WebcamFeed from './WebcamFeed';
import './HomePage.css';

const FocusSession = ({ setSessionActive }) => {
  const [alert, setAlert] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState(null); // Initialize startTime state
  const [attentionData, setAttentionData] = useState([]);

  const handleFaceDetected = useCallback((isDetected) => {
    let noFaceTime = 0;

    if (!isDetected) {
      noFaceTime += 1;
    } else {
      noFaceTime = 0;
    }

    if (noFaceTime > 10) { // Trigger alert after 10 seconds of no face detection
      setAlert(true);
    } else {
      setAlert(false);
    }
  }, []);

  useEffect(() => {
    setSessionStarted(true);
    setStartTime(new Date()); // Set the session's start time
  }, []);

  const endSession = async () => {
    setSessionStarted(false);
    setAlert(false);

    const sessionData = {
      startTime: new Date(startTime),
      endTime: new Date(),
      attentionSpans: attentionData, // Array of attention metrics
    };

    try {
      // Send the session data to the server
      await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      setSessionActive(false); 
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  };

  return (
    <div className="focus-session-container">
      {sessionStarted && (<button className="session end" onClick={endSession}>
        <img src="/circle-stop.svg" alt="Icon" />
        <span>End session</span>
      </button>)}
      <div className="webcam-feed">
        <WebcamFeed onFaceDetected={handleFaceDetected} />
      </div>
      {alert && <div className="alert">Are you still there?</div>}
    </div>
  );
};

export default FocusSession;
