import React, { useState } from 'react';
import WebcamFeed from './WebcamFeed';

const FocusSession = () => {
  const [alert, setAlert] = useState(false);
  let noFaceTime = 0;

  const handleFaceDetected = (isDetected) => {
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
  };

  return (
    <div>
      <WebcamFeed onFaceDetected={handleFaceDetected} />
      {alert && <div className="alert">Are you still there?</div>}
    </div>
  );
};

const endSession = async () => {
    const sessionData = {
      startTime: new Date(startTime),
      endTime: new Date(),
      attentionSpans: attentionData, // Array of attention metrics
    };
  
    await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
  };

export default FocusSession;
