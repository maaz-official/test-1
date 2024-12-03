import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../Screens/auth/LoginScreen';
import { OnboardingScreen } from '../../Screens/auth/OnboardingScreen';
import { CreateAccountScreen } from '../../components/onboarding/CreateAccountScreen';
import { OtpScreen } from '../../components/onboarding/OtpScreen'; // Ensure this is imported
import { InformationScreen } from '../../components/onboarding/InformationScreen';
import { CreatePasswordScreen } from '../../components/onboarding/CreatePasswordScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ title: 'Onboarding' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
        options={{ title: 'OTP Verification' }}
      />
      <Stack.Screen
        name="InformationScreen"
        component={InformationScreen}
        options={{ title: 'Information Screen' }}
      />
      <Stack.Screen
        name="CreatePasswordScreen"
        component={CreatePasswordScreen}
        options={{ title: 'Password Screen' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
