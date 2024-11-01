require('dotenv').config();

// Import the 'express' module which provides the web framework.
const express = require('express');

// Create an Express application instance.
const app = express();

// To parse incoming JSON requests.
app.use(express.json());

// CORS enables frontend to communicate with backend
const cors = require('cors');

// Enables CORS for all routes with default settings
app.use(cors());

// Import the Firebase Admin SDK
const admin = require('firebase-admin');

// Load the service account key JSON file which contains credentials for Firebase Admin SDK
const serviceAccount = require('./config/serviceAccountKey.json');

// Initialize the Firebase Admin app with the service account credentials
// This allows the admin SDK to interact with Firebase services (like authentication)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://focus-buddy-f8f37.firebaseio.com'
});

// Initialize Firestore database
const db = admin.firestore();

// Middleware function to authenticate an incoming request using Firebase ID Token
const authenticateToken = async (req, res, next) => {
  // Retrieve the token from the 'Authorization' header of the incoming request
  const authHeader = req.headers.authorization;

  // Check if the token exists and is in the expected "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  // Extract the actual ID token by removing the "Bearer " prefix
  const idToken = authHeader.split(' ')[1];

  try {
    // Verify the ID token with Firebase Admin SDK
    // If valid, this returns the decoded token with user information
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach the decoded token xto the request object for future use
    req.user = decodedToken;

    // Call the next middleware or route handler since the token is valid
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).send('Unauthorized');
  }
};

// Define a POST endpoint at '/api/sessions'.
// This endpoint allows clients to send session data to the server.
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from token
    const sessionData = { ...req.body, userId };

    // Accesses the 'sessions' collection in the Firestore database and adds a new document to the specified collection.
    // A unique ID is automatically generated for the new document.
    const sessionRef = await db.collection('sessions').add(sessionData);

    // Fetch the saved session data
    const sessionSnapshot = await sessionRef.get();
    const session = sessionSnapshot.data();

    res.status(201).send(session);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).send('Failed to save session');
  }
});

// Start the Express server on a specified port and log a message indicating the server is running.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Route to get all session data
app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .orderBy('startTime')
      .get();

    let sessions = [];
    let totalSessionTime = 0;
    let totalFocusTime = 0;
    let totalAlerts = 0;

    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      
      const sessionDuration = new Date(session.endTime) - new Date(session.startTime);

      const sessionDurationSeconds = Math.floor(sessionDuration / 1000); // total time in seconds
      totalSessionTime += sessionDurationSeconds;
      totalFocusTime += session.totalTimeFocused;
      totalAlerts += session.numberOfAlerts;

      sessions.push({ ...session });
    });

    const averageFocusPercentage = totalSessionTime ? (totalFocusTime / totalSessionTime) * 100 : 0;
    const averageAlerts = sessions.length > 0 ? totalAlerts / sessions.length : 0;

    res.status(200).json({
      sessions,
      totalSessionTime,
      totalFocusTime,
      totalAlerts,
      averageAlerts,
      averageFocusPercentage
    });
  } catch (error) {
    console.error('Failed to fetch session data:', error);
    res.status(500).send('Failed to fetch session data');
  }
});

// Route to get the most recent session
app.get('/api/sessions/latest', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch the most recent session for the user
    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .orderBy('startTime', 'desc')
      .limit(1)
      .get();

    if (sessionsSnapshot.empty) {
      return res.status(404).send('No session found');
    }

    // Retrieves first and only document from array of snapshots for latest session
    const latestSessionDoc = sessionsSnapshot.docs[0];
    const latestSession = latestSessionDoc.data();

    res.status(200).json(latestSession);
  } catch (error) {
    console.error('Failed to fetch the latest session:', error);
    res.status(500).send('Server error');
  }
});

// Route to delete all session history
app.delete('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch all sessions for the user
    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .get();

    // Creates a WriteBatch object that allows to perform multiple
    // write operations (like set, update, delete) as a single atomic unit.
    // All operations in the batch are committed together. If any operation fails, none of the changes are applied.
    const batch = db.batch();

    sessionsSnapshot.forEach(doc => {
      // Queues a delete operation for the document referenced by doc.ref.
      // The document is not deleted immediately; the delete operation is added to the batch queue.
      batch.delete(doc.ref);
    });

    // Executes all the operations queued in the write batch.
    await batch.commit();

    res.status(200).send('Session history cleared');
  } catch (error) {
    console.error('Failed to clear session history:', error);
    res.status(500).send('Failed to clear session history');
  }
});