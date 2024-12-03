// types/navigationTypes.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Types (Main Navigation)
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;

  // Onboarding flow
  Welcome: undefined;
  Tutorial: undefined;
  TermsAndConditions: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;

  // Main Tabs navigation
  MainTabs: NavigatorScreenParams<TabStackParamList>;
};

// Auth Stack Types (Authentication-related screens)
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string }; // If token is required for reset password
};

// Onboarding Stack Types (Onboarding screens)
export type OnboardingStackParamList = {
  Welcome: undefined;
  Tutorial: undefined;
  TermsAndConditions: undefined;
};

// Tab Stack Types (Tab-based navigation)
export type TabStackParamList = {
  Home: undefined;
  ExamHub: undefined;
  Favorites: undefined;
  Menu: undefined;
};

// Bottom Tab Navigation Types
export type TabParamList = {
  Home: undefined;
  Favorite: undefined;
  ExamHub: undefined;
  Menu: undefined;
};

// Combined Navigation Types for the whole app (Used in hooks and throughout the app)
export type AppNavigationParamList = RootStackParamList & {
  Onboarding: OnboardingStackParamList;
  MainTabs: TabStackParamList;
};
