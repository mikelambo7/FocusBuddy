const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Creates an Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json()); // Parse JSON requests

// Middleware to authenticate requests
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).send('Unauthorized');
  }
};

// Routes

// Save a session
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const sessionData = { ...req.body, userId };

    const sessionRef = await db.collection('sessions').add(sessionData);
    const sessionSnapshot = await sessionRef.get();
    const session = sessionSnapshot.data();

    res.status(201).send(session);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).send('Failed to save session');
  }
});

// Get all session data
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

      const sessionDurationSeconds = Math.floor(sessionDuration / 1000); // Total time in seconds
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

// Get the most recent session
app.get('/api/sessions/latest', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .orderBy('startTime', 'desc')
      .limit(1)
      .get();

    if (sessionsSnapshot.empty) {
      return res.status(404).send('No session found');
    }

    const latestSessionDoc = sessionsSnapshot.docs[0];
    const latestSession = latestSessionDoc.data();

    res.status(200).json(latestSession);
  } catch (error) {
    console.error('Failed to fetch the latest session:', error);
    res.status(500).send('Server error');
  }
});

// Delete all session history
app.delete('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();

    sessionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.status(200).send('Session history cleared');
  } catch (error) {
    console.error('Failed to clear session history:', error);
    res.status(500).send('Failed to clear session history');
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

