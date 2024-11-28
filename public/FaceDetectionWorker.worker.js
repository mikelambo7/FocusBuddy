/* global cv */
importScripts('https://docs.opencv.org/4.10.0/opencv.js');

// Utility function to load cascade files
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

cv.onRuntimeInitialized = () => {
  loadCascadeFile('/haarcascade_frontalface_default.xml', 'haarcascade_frontalface_default.xml', () => {
    loadCascadeFile('/haarcascade_eye.xml', 'haarcascade_eye.xml', () => {
      let faceClassifier = new cv.CascadeClassifier();
      let eyeClassifier = new cv.CascadeClassifier();
      faceClassifier.load('haarcascade_frontalface_default.xml');
      eyeClassifier.load('haarcascade_eye.xml');

      self.onmessage = function (e) {
        const imageData = e.data;
        let src = cv.matFromImageData(imageData);
        let gray = new cv.Mat();

        // Convert image to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Detect faces
        let faces = new cv.RectVector();
        faceClassifier.detectMultiScale(gray, faces, 1.2, 3, 0, new cv.Size(50, 50)); // Adjusted parameters

        let results = [];
        for (let i = 0; i < faces.size(); ++i) {
          let face = faces.get(i);

          // Validate face size
          if (face.width < 50 || face.height < 50) continue; // Skip small faces

          // Extract face region
          let faceROI = gray.roi(face);

          // Detect eyes within the face region
          let eyes = new cv.RectVector();
          eyeClassifier.detectMultiScale(faceROI, eyes, 1.1, 3, 0, new cv.Size(30, 30));

          // Validate eyes
          if (eyes.size() < 2) {
            faceROI.delete();
            eyes.delete();
            continue; // Skip faces without two eyes
          }

          let eyeCenters = [];
          for (let j = 0; j < eyes.size(); ++j) {
            let eye = eyes.get(j);
            eyeCenters.push({ x: eye.x + eye.width / 2, y: eye.y + eye.height / 2 });
          }

          results.push({ face: { x: face.x, y: face.y, width: face.width, height: face.height }, eyes: eyeCenters });

          faceROI.delete();
          eyes.delete();
        }

        // Post results if valid detections are found
        postMessage(results.length > 0 ? results : null);

        // Cleanup
        src.delete();
        gray.delete();
        faces.delete();
      };
    });
  });
};
