import React, { useRef, useEffect } from 'react';

const WebcamFeed = ({ onFaceDetected }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });

    const detectFace = () => {
      // TODO: Implement face detection logic
    };

    // Set up an interval to repeatedly check for face detection
    const interval = setInterval(detectFace, 1000);

    return () => clearInterval(interval);
  }, []);

  return <video ref={videoRef} autoPlay></video>;
};

export default WebcamFeed;
