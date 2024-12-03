// src/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Custom provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context 
export const useAuth = () => useContext(AuthContext);
