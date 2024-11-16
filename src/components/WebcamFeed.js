import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

const WebcamFeed = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const runFaceMesh = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();

        // Load the MediaPipe FaceMesh model
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'mediapipe',
          maxFaces: 1,
          refineLandmarks: true,
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        };
        const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);

        // Set up camera stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          detectFace(detector);
        };
      } catch (error) {
        console.error('Error in runFaceMesh:', error);
      }
    };

    const detectFace = async (detector) => {
      try {
        if (videoRef.current.readyState === 4 && isMounted) {
          const video = videoRef.current;

          const detectionLoop = async () => {
            if (!isMounted) return;

            // Make predictions
            const faces = await detector.estimateFaces(video);

            console.log('Faces detected:', faces.length);

            let faceDetected = false;

            if (faces.length > 0) {
              const keypoints = faces[0].keypoints;

              // Determine if the face is looking directly
              const isLookingStraight = checkIfLookingStraight(keypoints);
              faceDetected = isLookingStraight;
            }

            // Pass the result to the parent component
            onFaceDetected(faceDetected);

            // Continue the detection loop
            animationFrameIdRef.current = requestAnimationFrame(detectionLoop);
          };

          detectionLoop();
        }
      } catch (error) {
        console.error('Error in detectFace:', error);
      }
    };

    const checkIfLookingStraight = (keypoints) => {
      const noseTipIndex = 1;
      const leftEyeIndex = 33;
      const rightEyeIndex = 263;
    
      const noseTip = keypoints[noseTipIndex];
      const leftEye = keypoints[leftEyeIndex];
      const rightEye = keypoints[rightEyeIndex];
    
      if (!noseTip || !leftEye || !rightEye) {
        console.warn('Missing keypoints for gaze detection.');
        return false;
      }
    
      // Calculate horizontal distances
      const distLeft = Math.abs(noseTip.x - leftEye.x);
      const distRight = Math.abs(rightEye.x - noseTip.x);
    
      console.log('distLeft:', distLeft);
      console.log('distRight:', distRight);
    
      // Calculate the ratio
      const ratio = distLeft / distRight;
      console.log('Ratio:', ratio);
    
      // Set a threshold for considering the face to be looking straight
      const ratioThreshold = 0.40; // Adjust based on testing
      const isLookingStraight = Math.abs(ratio - 1) < ratioThreshold;
    
      return isLookingStraight;
    };
    
    runFaceMesh();

    return () => {
      isMounted = false;

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

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
