** Focus Buddy **

Welcome to Focus Buddy, a web application designed to help users maintain focus during study or work sessions by monitoring their attention through webcam facial recognition. This README provides step-by-step instructions to set up, run, and understand the application.

** Overview **

Focus Buddy uses your webcam to detect if you're looking at your screen during a focus session. If it detects that you've looked away for too long, it sends alerts to help you regain focus. It also tracks your focus statistics over time.

** Prerequisites **

Before you begin, ensure you have met the following requirements:

1. Node.js (v18 or later) - Download from Node.js official website.
2. npm (comes with Node.js).

** Steps to Run the Application **

1. Navigate to focus-buddy directory ```cd focus-buddy```
2. Install necessary dependencies  using ```npm install```
3. Start the backend server using ```PORT=<port-number> nodemon index.js``` for example ```PORT=3001 nodemon index.js```
4. Start the application using ```NODE_OPTIONS=--openssl-legacy-provider npm start```
5. Once both the backend and frontend are running, open your browser and navigate to: http://localhost:3000

** How the Application works **

1. Create an account or log in to your existing account.
2. Begin a focus session by clicking the "Start Session" button.
3. Let the app monitor your attention while you focus on your tasks. The app uses your webcam to ensure you're looking at your screen.
4. If you look away for too long, you'll receive a browser notification and a sound alert to help you refocus.
5. Click "End Session" to stop monitoring. Your session data will be saved.
6. Visit the Dashboard page to view:
    • Cumulative account stats
    • Focus trends over time
    • Recent session statistics




Enjoy using Focus Buddy to stay focused and improve your productivity!




