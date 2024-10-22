import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Creates a Context that components can provide or read.
const AuthContext = createContext();

// Uses Context's value
export const useAuth = () => useContext(AuthContext);

// Wraps the application and provides the authentication context to all components within it.
// Children is a prop that represents the nested components inside the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // Tracks whether the authentication status is still being determined
  // Ensures that the app does not render content prematurely before the authentication check complete
  const [loading, setLoading] = useState(true); // Prevents flickering

  useEffect(() => {
    // unsubscribe is a function that allows you to stop listening for auth changes when the component is unmounted.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    // Any component that uses useAuth() will have access to the current authenticated use
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
