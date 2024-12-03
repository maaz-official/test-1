# Insport App

**Insport App** is a scalable and modular React Native app, built with Expo, designed to aid students to join events by proving easy access to past papers across multple subjecs and levels. The app featurs a robust ExamHub with advanced filterin options, offline access, and a secure authentication flow for a personalie
---
## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Folder Structure](#folder-structure)
5. [Scripts](#scripts)
6. [Environment Configuration](#environment-configuration)
7. [Dependencies](#dependencies)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

---

## Features

- **Exam Hub**: Discover and filter past papers by subject, year, and level for focused exam preparation.
- **Secure Authentication Flow**: Manage user accounts and data securely.
- **Offline Mode**: Download and access papers without internet connectivity.
- **Cross-Platform Compatibility**: Runs on iOS, Android, and Web via Expo.

---

## Installation

To run this project locally, ensure you have Node.js and Expo CLI installed.

1. Clone the repository

```bash
git clone https://github.com/algorithmio/exam-square-mobile.git
cd exam-square-mobile
```

2. Install dependencies

```bash
npm install
```

## Project Structure

``` bash
├── app                        # Main application logic
│   ├── (onboarding)          # Onboarding flow screens
│   │   ├── termsAndConditions.tsx  # Terms and Conditions screen
│   │   ├── tutorial.tsx            # Tutorial screen
│   │   └── welcome.tsx            # Welcome screen
│   ├── (tabs)                 # Tab-based navigation
│   │   ├── exam-hub.tsx           # Exam Hub screen
│   │   ├── favorite.tsx           # Favorites screen
│   │   ├── home.tsx              # Home screen
│   │   └── menu.tsx              # Menu screen
│   ├── +html.tsx                # A catch-all HTML screen (if any)
│   ├── +not-found.tsx           # 404 or page not found screen
│   ├── auth                    # Authentication-related screens
│   │   ├── forgotPassword.tsx    # Forgot Password screen
│   │   ├── login.tsx             # Login screen
│   │   ├── resetPassword.tsx     # Reset Password screen
│   │   └── signup.tsx            # Signup screen
│   ├── index.tsx                # Main entry point of the app
│   ├── splash.tsx               # Splash screen
│   ├── _error.tsx               # Global error screen for handling unexpected errors
│   ├── _layout.tsx              # Layout component (e.g., headers, footers)
├── assets                      # Static assets
│   ├── fonts                    # Custom font files
│   │   └── SpaceMono-Regular.ttf
│   ├── images                   # Image assets
│   │   ├── adaptive-icon.png
│   │   ├── favicon.png
│   │   ├── icon.png
│   │   ├── logo.png
│   │   ├── partial-react-logo.png
│   │   ├── react-logo.png
│   │   ├── react-logo@2x.png
│   │   ├── react-logo@3x.png
│   │   └── splash.png
├── components                  # Reusable UI components
│   ├── Buttons.tsx             # Button component
│   ├── Collapsible.tsx         # Collapsible UI component
│   ├── ExternalLink.tsx        # External link component
│   ├── HelloWave.tsx           # Hello wave greeting component
│   ├── Icons.tsx               # Icon components
│   ├── navigation              # Tab navigation components
│   │   └── TabBarIcon.tsx
│   ├── ParallaxScrollView.tsx  # Parallax scroll view component
│   ├── ThemedText.tsx          # Themed text component
│   ├── ThemedView.tsx          # Themed view component
│   ├── Typography.tsx          # Typography components
│   ├── ui                      # UI configuration components (Gluestack or other UI frameworks)
│   │   ├── gluestack-ui-provider
│   │   │   ├── config.ts
│   │   │   ├── index.tsx
│   │   │   ├── index.web.tsx
│   │   │   └── script.ts
│   │   ├── heading
│   │   │   ├── index.tsx
│   │   │   ├── index.web.tsx
│   │   │   └── styles.tsx
│   ├── __tests__               # Unit and integration tests for components
│   │   └── ThemedText-test.tsx  # Test file for ThemedText component
│   ├── __snapshots__           # Snapshot tests for ThemedText component
│   │   └── ThemedText-test.tsx.snap
├── config                      # App configuration files (API, theme, etc.)
│   ├── api.config.ts           # API configuration
│   └── theme.config.ts         # Theme configuration
├── constants                   # Global constants (API endpoints, colors, etc.)
│   ├── ApiRoutes.ts            # API route constants
├── hooks                       # Custom reusable hooks
│   ├── useColorScheme.ts       # Hook for handling light/dark theme
│   ├── useColorScheme.web.ts   # Web-specific hook for color scheme
│   └── useThemeColor.ts        # Hook for managing theme colors
├── navigation                  # Navigation setup (root and tab navigation)
│   ├── navigation.config.ts    # Centralized navigation configuration
│   ├── Navigator.tsx           # navigation setup
├── services                    # API and storage services
│   ├── api                     # API logic
│   │   ├── authApi.ts          # Auth-related API calls
│   │   └── userApi.ts          # User-related API calls
│   └── storage                 # Local storage management (AsyncStorage)
│       ├── authStorage.ts      # Auth-specific storage management
│       └── userStorage.ts      # User-specific storage management
├── state                       # Global state management
│   └── store.ts                # Centralized state store
├── themes                      # Theme-related files (colors, typography, etc.)
│   ├── colors.ts               # Color palette
│   ├── darkTheme.ts            # Dark theme configuration
│   └── typography.ts           # Typography settings
│   └── ThemeProvider.tsx       # ThemeProvider 
├── types                       # TypeScript types and interfaces
│   ├── apiTypes.ts             # Types for API responses and requests
│   ├── index.ts                # Consolidated type exports
│   └── navigationTypes.ts      # Types for navigation (params, routes, etc.)
├── utils                       # Utility functions
│   ├── format.ts               # Formatting utilities (e.g., date, string)
│   └── validation.ts           # Validation utilities (form validation)
├── node_modules                # Node modules
├── metro.config.js             # Metro bundler configuration
├── nativewind-env.d.ts        # TypeScript definitions for nativewind
├── global.css                  # Global CSS for web applications
├── gluestack-ui.config.json    # Gluestack UI configuration
├── babel.config.js             # Babel configuration for JavaScript/TypeScript compilation
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package-lock.json           # Lock file for dependencies
├── package.json                # Project npm configuration
├── .npmrc                    # npm configuration file (e.g., registry, package manager settings)
├── .gitignore                # Specifies files and directories to be ignored by Git
├── README.md                   # Project documentation


```

### Key Folders

- `app/navigation/`: Defines app navigation with routing configurations.
- `app/screens/`: Organizes screens by feature, promoting module-based development.
- `app/state/`: Centralizes state management (e.g., Redux or Context API).
- `app/services/`: API handlers and local storage management for data persistence.
- `app/themes/`: Provides theme settings to support dark and light modes.

---

### Scripts

The project provides a set of npm scripts to streamline development:

- ```bash
  npm start


**Note:** Some directories and files are omitted for brevity.

### Scripts
The project provides a set of npm scripts to streamline development:

Start the Expo development server.
```bash
npx expo start
```
Run the app on an IOS emulator.
```bash
npm run ios
```

Run the app on an Android emulator.
```bash
npm run android
```

Start the app in a web browser.
```bash
npm run web
```

Lints the codebase for errors and code style.
```bash
npm run lint
```

## Dependencies

This project is built using a range of libraries to support app functionality and user experience.

### Core Libraries
- **React Native**: Foundation for building cross-platform apps.
- **Expo**: A set of tools and libraries to streamline React Native development.
- **React Navigation**: Navigation library for managing screens and routes.
- **NativeWind**: Provides Tailwind CSS-like utility classes for styling React Native.
- **Gluestack UI**: UI components and styling utilities for consistent design.

### Testing & Utilities
- **Jest**: JavaScript testing framework for unit and integration tests.
- **React Test Renderer**: For rendering components during tests.
- **Expo Router**: Simplifies routing in Expo projects.
- **TailwindCSS**: Utility-first CSS framework adapted for NativeWind.
This structure keeps it clean and easy to follow, which is typical for a README file.
