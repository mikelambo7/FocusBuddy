import React, { useRef, useEffect } from 'react';

const WebcamFeed = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
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

  return <video ref={videoRef} autoPlay></video>;
};

export default WebcamFeed;
