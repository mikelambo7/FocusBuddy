import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import DashboardPage from './components/DashboardPage';
import LandingPage from './components/LandingPage';
import SignUp from './firebase/SignUp.js';
import Login from './firebase/Login.js';
import ProtectedRoute from './firebase/ProtectedRoute.js';
import { AuthProvider } from './firebase/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
      </Router>
    </AuthProvider>
  );
}

export default App;