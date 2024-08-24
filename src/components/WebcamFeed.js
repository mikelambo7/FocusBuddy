import React, { useRef, useEffect } from 'react';
import cv from 'opencv.js';

const WebcamFeed = ({ onFaceDetected }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });

    const detectFace = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Create a 2D rendering context for a 'canvas' element in HTML
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        const faces = new cv.RectVector();
        const classifier = new cv.CascadeClassifier();

        // Pre-trained model used to detect faces in video frames
        classifier.load('haarcascade_frontalface_default.xml');
      
        classifier.detectMultiScale(gray, faces);
        if (faces.size() > 0) {
          onFaceDetected(true);
        } else {
          onFaceDetected(false);
        }
      
        src.delete();
        gray.delete();
        faces.delete();
        classifier.delete();
    };

    // Set up an interval to repeatedly check for face detection
    const interval = setInterval(detectFace, 100);

    return () => clearInterval(interval);
  }, []);

  return <video ref={videoRef} autoPlay></video>;
};

export default WebcamFeed;
