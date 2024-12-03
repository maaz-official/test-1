// themes/ThemeProvider.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import useAppStore from '@/state/store';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme } = useAppStore();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  return (
    <>
      {/* Set the status bar color based on theme */}
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {/* You can add other theme-related settings here */}
      {children}
    </>
  );
};

export default ThemeProvider;
