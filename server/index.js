require('dotenv').config();

// Import the 'express' module which provides the web framework.
const express = require('express');

// Import the 'mongoose' module for MongoDB object modeling.
const mongoose = require('mongoose');

// Create an Express application instance.
const app = express();

// To parse incoming JSON requests.
app.use(express.json());

// Connect to a MongoDB database using Mongoose.
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define a Mongoose schema for the session data.
const sessionSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  totalSessionTime: Number,
  totalTimeUnfocused: Number,
  totalTimeFocused: Number,
  numberOfAlerts: Number,
  focusPercent: Number,
});

// Create a Mongoose model based on the sessionSchema.
const Session = mongoose.model('Session', sessionSchema);

// Define a POST endpoint at '/api/sessions'.
// This endpoint allows clients to send session data to the server.
app.post('/api/sessions', async (req, res) => {
  const session = new Session(req.body);
  await session.save();
  res.status(201).send(session);
});

// Start the Express server on a specified port and log a message indicating the server is running.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Route to get all session data
app.get('/api/sessions', async (req, res) => {
  try {
    // Fetch all session documents from the database
    const sessions = await Session.find();
    
    let totalSessionTime = 0;
    let totalFocusTime = 0;
    let totalAlerts = 0;

    sessions.forEach(session => {
      const sessionDuration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000); // total time in seconds
      totalSessionTime += sessionDuration;

      totalFocusTime += session.totalTimeFocused;

      totalAlerts += session.numberOfAlerts;
    });

    const averageFocusPercentage = totalSessionTime ? (totalFocusTime / totalSessionTime) * 100 : 0;

    res.status(200).json({
      sessions,
      totalSessionTime,
      totalFocusTime,
      totalAlerts,
      averageFocusPercentage
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch session data');
  }
});

// Route to get the most recent session
app.get('/api/sessions/latest', async (req, res) => {
  try {
    // Fetch the most recent session, sorted by startTime in descending order
    const latestSession = await Session.findOne().sort({ startTime: -1 });

    if (!latestSession) {
      return res.status(404).send('No session found');
    }

    res.status(200).json(latestSession);
  } catch (error) {
    console.error('Failed to fetch the latest session:', error);
    res.status(500).send('Server error');
  }
});

// Route to delete all session history
app.delete('/api/sessions', async (req, res) => {
  try {
    await Session.deleteMany(); // Deletes all session documents from the collection
    res.status(200).send('Session history cleared');
  } catch (error) {
    console.error('Failed to clear session history:', error);
    res.status(500).send('Failed to clear session history');
  }
});