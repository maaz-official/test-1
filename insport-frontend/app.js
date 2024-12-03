// app.js
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator.js'; // Main navigator for the app
import { AuthProvider, useAuth } from './src/authContext/AuthProvider.js'; // Context provider for global state
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import Footer from './src/components/onboarding/Footer.js';
import iconsData from './src/api/icons.json'; // Use the correct relative path

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // Preload fonts and other resources
  useEffect(() => {
    async function loadResources() {
      try {
        // Load custom fonts if you have any
        await Font.loadAsync({
          // 'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
          // Add more fonts here if needed
        });
      } catch (e) {
        console.warn(e);
      } finally {
        console.log('Icons data set:', iconsData);
        setIsReady(true); // Set ready state to true after resources are loaded
      }
    }

    loadResources();
  }, []);

  if (!isReady) {
    // While resources are loading, show a loading spinner
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppWrapper />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppWrapper() {
  const { isLoggedIn } = useAuth(); // Use the custom hook to access the Auth context

  return (
    <>
      <AppNavigator />
      {isLoggedIn && <Footer />} {/* Conditionally show the footer if logged in */}
    </>
  );
}
