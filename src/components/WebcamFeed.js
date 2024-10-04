import React, { useRef, useEffect } from 'react';
import cv from 'opencv.js';

const WebcamFeed = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);  // To store the webcam media stream

  useEffect(() => {
    // Provides access to the user's webcam and streams the video feed to an HTML video element
    navigator.mediaDevices.getUserMedia({ video: true }) // Prompts the user for permission to access the webcam.
      .then(stream => {
        videoRef.current.srcObject = stream; // Sets the srcObject of the video element to the MediaStream obtained from the user's webcam
        streamRef.current = stream;  // Store the media stream in a ref for later cleanup
      })
      .catch(err => console.error('Error accessing webcam:', err));

    const detectFace = () => {
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
      
        // Loads the image data from the canvas.
        const src = cv.imread(canvas);
        // Creates a new empty Mat object which will be used to store the grayscale version of the image.
        const gray = new cv.Mat();
        // Converts the image in src from its original color format (RGBA) to grayscale.
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        // Creates a container for storing the rectangles (bounding boxes) around detected faces.
        const faces = new cv.RectVector();
        // Creates a new CascadeClassifier object used to load a pre-trained model for detecting objects in images.
        const classifier = new cv.CascadeClassifier();

        // Loads a pre-trained model used to detect faces in video frames
        classifier.load('haarcascade_frontalface_default.xml');
      
        // Runs the face detection algorithm on the grayscale image and stores detected faces as rectangles in the faces vector
        classifier.detectMultiScale(gray, faces);

        // Checks if any faces were detected and calls onFaceDetected(true) if a face is present and onFaceDetected(false) otherwise.
        if (faces.size() > 0) {
          onFaceDetected(true);
        } else {
          onFaceDetected(false);
        }

        // Release the memory allocated for the Mat and RectVector objects, as well as the CascadeClassifier.
        src.delete();
        gray.delete();
        faces.delete();
        classifier.delete();
    };

    // Set up an interval to repeatedly check for face detection
    const interval = setInterval(detectFace, 100);

    return () => {
      clearInterval(interval);  // Clear face detection interval

      // Stop all tracks of the media stream to properly turn off the webcam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onFaceDetected]);

  return <video ref={videoRef} autoPlay></video>;
};

export default WebcamFeed;
