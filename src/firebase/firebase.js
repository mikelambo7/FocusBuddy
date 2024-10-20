// Imports the functions needed from the SDKs needed
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDW7PxWSJT_fpgCR0NjPx3e3Bf1fnz-ick",
  authDomain: "focus-buddy-f8f37.firebaseapp.com",
  projectId: "focus-buddy-f8f37",
  storageBucket: "focus-buddy-f8f37.appspot.com",
  messagingSenderId: "698224682600",
  appId: "1:698224682600:web:53f1c791597e9c0cca3ddd",
  measurementId: "G-HE4WK321F0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };