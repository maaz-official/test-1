import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './stacks/AuthStack.js';   // Authentication stack
import MainStack from './stacks/MainStack';   // Main stack
import SplashScreen from '../Screens/splash/SplashScreen.js'; // Custom splash screen

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track user authentication state

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds delay for splash screen

    return () => clearTimeout(timeout);
  }, []);

  // Simulate user authentication check (this could come from context or props)
  useEffect(() => {
    // Replace this with your actual authentication logic
    const checkUserLoggedIn = async () => {
      // Simulating an API call or checking user state
      const userLoggedIn = await fakeAuthCheck(); // Replace with actual auth check
      setIsLoggedIn(userLoggedIn);
    };

    checkUserLoggedIn();
  }, []);

  const fakeAuthCheck = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(false); // Change this to true if you want to simulate a logged-in state
      }, 1000); // Simulate a 1 second API call
    });
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator initialRouteName={isLoggedIn ? "MainStack" : "AuthStack"}>
      <Stack.Screen 
        name="AuthStack"
        component={AuthStack}
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="MainStack"
        component={MainStack}
        options={{ headerShown: false }}  
      />
      {/* Navigate based on authentication state */}
      {/* <Stack.Screen 
        name="HomePage" 
        component={MainStack} // Conditional rendering
        options={{ headerShown: false }} 
      /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
