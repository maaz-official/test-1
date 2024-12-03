// theme.js for React Native

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Function to create responsive sizes based on the device's dimensions
const responsiveSize = (size) => {
  const baseWidth = 375; // Reference width (iPhone 6/7/8)
  return Math.round((width / baseWidth) * size);
};

// Base font size for scaling purposes
const baseFontSize = 16;

// Function to calculate responsive font sizes
const responsiveFontSize = (size) => {
  return Math.round((size / baseFontSize) * baseFontSize);
};

// Colors palette
export const Colors = {
  primary: '#10B981',      // Main color
  secondary: '#EF4444',    // Accent color
  background: '#C5C6D0',   // Default background color
  textPrimary: '#101010',   // Main text color
  textSecondary: '#FFFFFF',  // Secondary text color
  error: '#e74c3c',        // Error color

  // Additional colors for dark/light themes
  lightBackground: '#FFFFFF',
  darkBackground: '#000000',
  lightText: '#000000',
  darkText: '#FFFFFF',

  // Neutral colors
  grayLight: '#F7F7F7',
  grayMedium: '#B0B0B0',
  grayDark: '#4F4F4F',

  // Accessibility colors
  accessibleBackground: '#FFFFFF', // For accessible components
  accessibleText: '#000000',
};

// Spacing utility for consistent layouts
export const Spacing = {
  small: responsiveSize(8),
  medium: responsiveSize(16),
  large: responsiveSize(24),
  xLarge: responsiveSize(32),
  xxLarge: responsiveSize(40),
};

// Font sizes for typography
export const FontSizes = {
  small: responsiveFontSize(14),
  medium: responsiveFontSize(18),
  large: responsiveFontSize(24),
  xLarge: responsiveFontSize(30),
  xxLarge: responsiveFontSize(36),
};

// Border radii for consistent UI elements
export const BorderRadii = {
  small: responsiveSize(5),
  medium: responsiveSize(10),
  large: responsiveSize(20),
  full: 9999, // Full border radius for circles
};

// Margin and padding utility
export const Margin = {
  top: responsiveSize(20),
  right: responsiveSize(20),
  bottom: responsiveSize(20),
  left: responsiveSize(20),
  allPages: responsiveSize(20),
};

// Typography settings for better management
export const Typography = {
  title: {
    fontSize: FontSizes.xLarge,
    fontWeight: '700', // Bold
    lineHeight: responsiveFontSize(40),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FontSizes.large,
    fontWeight: '600', // Semi-bold
    lineHeight: responsiveFontSize(30),
    letterSpacing: 0.4,
  },
  body: {
    fontSize: FontSizes.medium,
    fontWeight: '400', // Regular
    lineHeight: responsiveFontSize(24),
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: FontSizes.small,
    fontWeight: '300', // Light
    lineHeight: responsiveFontSize(20),
    letterSpacing: 0.2,
  },
};

// Theme object to manage light and dark modes
export const themes = {
  light: {
    backgroundColor: Colors.lightBackground,
    textColor: Colors.lightText,
    primaryColor: Colors.primary,
    secondaryColor: Colors.secondary,
  },
  dark: {
    backgroundColor: Colors.darkBackground,
    textColor: Colors.darkText,
    primaryColor: Colors.primary,
    secondaryColor: Colors.secondary,
  },
};

// Function to get theme based on user preference
export const getTheme = (theme) => {
  return {
    backgroundColor: themes[theme]?.backgroundColor || themes.light.backgroundColor,
    textColor: themes[theme]?.textColor || themes.light.textColor,
    primaryColor: themes[theme]?.primaryColor || themes.light.primaryColor,
    secondaryColor: themes[theme]?.secondaryColor || themes.light.secondaryColor,
  };
};

// Utility functions for handling shadows
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2, // Android elevation
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
};

// Combining all styles for easy access
export const combinedStyles = {
  container: {
    flex: 1,
    padding: Margin.allPages,
    backgroundColor: Colors.background,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.medium,
    borderRadius: BorderRadii.medium,
    alignItems: 'center',
    ...Shadows.small,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.small,
  },
  card: {
    borderRadius: BorderRadii.medium,
    padding: Spacing.medium,
    backgroundColor: Colors.background,
    ...Shadows.medium,
  },
};

// Media queries for responsive design (optional)
// Using for screen size breakpoints
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

// Function to check screen size
export const isMobile = () => width < Breakpoints.tablet;
export const isTablet = () => width >= Breakpoints.tablet && width < Breakpoints.desktop;
export const isDesktop = () => width >= Breakpoints.desktop;

// Export all utilities and styles
export const StyleUtils = {
  responsiveSize,
  responsiveFontSize,
  getTheme,
  isMobile,
  isTablet,
  isDesktop,
};
