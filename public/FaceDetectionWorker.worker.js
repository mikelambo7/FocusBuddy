/* global cv */

// Load OpenCV.js library into the Web Worker 
importScripts('/opencv.js'); // self refers to the webworker itself

// Utility function to load the classifier
function loadCascadeFile(url, filename, callback) {
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    if (this.status === 200) {
      let data = new Uint8Array(this.response);
      cv.FS_createDataFile('/', filename, data, true, false, false);
      callback();
    } else {
      console.error('Failed to load ' + url);
    }
  };
  request.send();
}

// Use the function to load the classifier
cv.onRuntimeInitialized = () => {
  loadCascadeFile('/haarcascade_frontalface_default.xml', 'haarcascade_frontalface_default.xml', () => {
    // Loads a pre-trained face detection model into the classifier that can detect faces in images
    let classifier = new cv.CascadeClassifier();
    classifier.load('haarcascade_frontalface_default.xml');

    // Set up the message handler
    self.onmessage = function (e) {
      // Obtain the image data that needs to be processed for face detection
      const imageData = e.data;
      // Converts the ImageData object into an OpenCV Mat (matrix) object which prepares it for processing with OpenCV functions
      let src = cv.matFromImageData(imageData);
      // Initializes a new, empty Mat object to hold the grayscale version of the image
      let gray = new cv.Mat();
      // Converts the source image (src) from RGBA color space to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      // Initializes a new RectVector object to store the bounding rectangles of detected faces.
      let faces = new cv.RectVector();
      // Runs the face detection algorithm on the grayscale image.
      // Detects faces within the image and store their bounding boxes in the faces vector.
      classifier.detectMultiScale(gray, faces);

      let faceDetected = faces.size() > 0;
      // Sends a message back to the main thread containing the result of the face detection.
      postMessage(faceDetected);

      // Calls the delete() method on OpenCV objects to release the memory they occupy.
      src.delete();
      gray.delete();
      faces.delete();
    };
  });
};
