import React, { useCallback, useEffect, useState } from 'react';
import WebcamFeed from './WebcamFeed';
import './HomePage.css';

const FocusSession = ({ setSessionActive }) => {
  const [alert, setAlert] = useState(false); // Alert to be shown when no face detected
  const [sessionStarted, setSessionStarted] = useState(false); // Keeps track of whether the session is started or not
  const [startTime, setStartTime] = useState(null); // Initialize startTime state to store timme a session starts
  const [attentionData, setAttentionData] = useState([]); // Initialize array to store attention metrics for a session

  /* To process whether a face has been detected by the webcam */
  const handleFaceDetected = useCallback((isDetected) => { // useCallback ensures function is memoized and not recreated on every render
    let noFaceTime = 0;

    if (!isDetected) {
      noFaceTime += 1;
    } else {
      noFaceTime = 0;
    }

    if (noFaceTime > 3) { // Trigger alert after 3 seconds of no face detection
      setAlert(true);
    } else {
      setAlert(false);
    }
  }, []);

  useEffect(() => {
    setSessionStarted(true);
    setStartTime(new Date()); // Set the session's start time as the current time
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
