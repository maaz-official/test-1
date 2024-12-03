import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../Screens/main/HomeScreen.js';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomePage"
        component={HomeScreen}
        options={{ title: 'Home Page' }}  // Set the header title for Home
      />
    </Stack.Navigator>
  );
};

export default MainStack;
