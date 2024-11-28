import React, { useRef, useEffect } from 'react';

const WebcamOffscreen = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (!isMounted) {
          // Component unmounted before stream was set
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      })
      .catch(err => console.error('Error accessing webcam:', err));

    // Initialize Web Worker
    workerRef.current = new Worker(`${process.env.PUBLIC_URL}/FaceDetectionWorker.worker.js`);

    workerRef.current.onmessage = function (e) {
      const faceDetected = e.data;
      onFaceDetected(faceDetected);
    };

    const captureFrame = () => {
      // Gives access to the video feed from the user's webcam.
      const video = videoRef.current;
      // Ensure video is ready.
      if (!video || video.readyState !== 4) return; 
      // Creates an element in memory that will be used to draw and manipulate the current video frame for further processing.
      const canvas = document.createElement('canvas');
      // Set the width and height of the canvas to match the resolution of the video feed.
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Create a 2D rendering context for a 'canvas' element in HTML which allows shapes to be drawn on the canvas.
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      // Send image data to Web Worker
      workerRef.current.postMessage(imageData);
    };

    // Set up an interval to capture frames
    const interval = setInterval(captureFrame, 500);

    return () => {
      isMounted = false;
      // Clear face detection interval
      clearInterval(interval);
      // Stop all tracks of the media stream to properly turn off the webcam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      } 

      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onFaceDetected]);

  return <video
  ref={videoRef}
  autoPlay
  style={{ display: 'none' }}
></video>;
};

export default WebcamOffscreen;