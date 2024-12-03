// src/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { userService } from '../api/userService.js'; // Import user service for API calls

// Create the UserContext
export const UserContext = createContext();

// UserProvider component to wrap the app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for current user
  const [loading, setLoading] = useState(true); // Loading state for user data

  // Function to log in the user
  const login = async (credentials) => {
    const userData = await userService.login(credentials); // Call API to log in
    setUser(userData); // Update user state
  };

  // Function to log out the user
  const logout = () => {
    userService.logout(); // Call API to log out
    setUser(null); // Clear user state
  };

  // Fetch the user on initial load (if already logged in)
  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await userService.getCurrentUser();
      setUser(loggedInUser);
      setLoading(false); // Once done fetching, stop loading
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
