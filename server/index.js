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
  attentionSpans: [Number], // Store attention metrics for each session
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

// Start the Express server on port 5000 and log a message indicating the server is running.
app.listen(5000, () => console.log('Server running on port 5000'));