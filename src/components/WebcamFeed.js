import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; // Provides machine learning functionalities in the browser.
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'; // Provides pre-trained models for detecting facial landmarks.
import '@tensorflow/tfjs-backend-webgl'; // Improves performance by leveraging GPU acceleration for TensorFlow.js computations.

const WebcamFeed = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameIdRef = useRef(null); // Stores the ID returned by requestAnimationFrame to cancel the animation frame during cleanup.

  useEffect(() => {
    let isMounted = true;

    // Function to initialize and run the face mesh model
    const runFaceMesh = async () => {
      try {
        // Set the TensorFlow.js backend to WebGL for better performance
        await tf.setBackend('webgl');
        await tf.ready();

        // Load the MediaPipe FaceMesh model which provides detailed facial landmarks
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;

        // Configuration for the face detector
        const detectorConfig = {
          runtime: 'mediapipe', // Use the MediaPipe runtime
          maxFaces: 1, // Detect only one face
          refineLandmarks: true, // Enables more detailed landmark detection, such as lips and eyes contours, for better accuracy.
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh', // Path to MediaPipe assets
        };

        // Create the face detector with the specified model and configuration
        const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);

        // Set up the webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true }); // Gets permission from user to access webcam
        if (videoRef.current) { // check if video has been mounted
          videoRef.current.srcObject = stream; // Use live webcam feed as video elements content
          streamRef.current = stream; // Store reference to media stream so it can used outside this function
        }

        // When the video metadata is loaded, start playing the video and begin face detection
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          detectFace(detector);
        };
      } catch (error) {
        console.error('Error in runFaceMesh:', error);
      }
    };

    // Function to detect faces and determine if the user is looking straight at the screen
    const detectFace = async (detector) => {
      try {
        if (videoRef.current.readyState === 4 && isMounted) { // Ensures video is fully loaded and component is still mounted
          const video = videoRef.current;

          // Async function that repeatedly performs face detection
          const detectionLoop = async () => {
            if (!isMounted) return; // Exit loop if the component is unmounted

            // Make predictions using the face detector
            const faces = await detector.estimateFaces(video); // Returns array of face data

            console.log('Faces detected:', faces.length);

            let faceDetected = false;

            if (faces.length > 0) {
              const keypoints = faces[0].keypoints;

              // Determine if the face is looking directly at the screen
              const isLookingStraight = checkIfLookingStraight(keypoints);
              faceDetected = isLookingStraight;
            }

            // Pass the faceDetected status to the parent component via the callback
            onFaceDetected(faceDetected);

            // Continue the detection loop by requesting the next animation frame
            animationFrameIdRef.current = requestAnimationFrame(detectionLoop); // Runs the detectionLoop function before the next browser screen repaint
          };

          detectionLoop();
        }
      } catch (error) {
        console.error('Error in detectFace:', error);
      }
    };

    // Function to check if the user is looking straight at the screen based on facial landmarks
    const checkIfLookingStraight = (keypoints) => {
      // Indices for key facial landmarks (nose tip and outer corners of the eyes) based on face mesh model mapping (https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/mesh_map.jpg)
      const noseTipIndex = 1; // Nose tip landmark index
      const leftEyeIndex = 33; // Left eye outer corner landmark index
      const rightEyeIndex = 263; // Right eye outer corner landmark index

      // Get the x and y coordinates of the nose tip and eye corners
      const noseTip = keypoints[noseTipIndex];
      const leftEye = keypoints[leftEyeIndex];
      const rightEye = keypoints[rightEyeIndex];

      // Check if any of the keypoints are missing
      if (!noseTip || !leftEye || !rightEye) {
        console.warn('Missing keypoints for gaze detection.');
        return false;
      }

      // Calculate the horizontal distances between the nose tip and each eye
      const distLeft = Math.abs(noseTip.x - leftEye.x);
      const distRight = Math.abs(rightEye.x - noseTip.x);

      console.log('distLeft:', distLeft);
      console.log('distRight:', distRight);

      // Calculate the ratio. If looking straight ratio should be close to 1
      const ratio = distLeft / distRight;
      console.log('Ratio:', ratio);

      // Set a threshold for considering the face to be looking straight
      // This allows some deviation due to natural asymmetry and slight head movements
      const ratioThreshold = 0.40;
      // Determine if the ratio is within the acceptable threshold
      const isLookingStraight = Math.abs(ratio - 1) < ratioThreshold;

      return isLookingStraight;
    };

    runFaceMesh();

    // Cleanup function to stop the webcam and cancel animations when the component unmounts
    return () => {
      isMounted = false;

      // Cancel the animation frame to stop the detection loop
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      // Stop the video stream to turn off the webcam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onFaceDetected]);

  return (
    <video
      ref={videoRef}
      autoPlay
      style={{ display: 'none' }}
    ></video>
  );
};

export default WebcamFeed;
