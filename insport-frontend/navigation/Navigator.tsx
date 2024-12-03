import React, { useEffect, useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import useAppStore from '@/state/store';
import { AUTH_NAVIGATION, MAIN_ROUTES, ROOT_ROUTES, TAB_NAVIGATION } from './navigation.config';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Splash from '@/app/splash';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Navigator = () => {
  const {
    isAuthenticated,
    theme,
  } = useAppStore();
  
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(Ionicons.font);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Application is ready
        setAppIsReady(true);
      }
    }

    SplashScreen.preventAutoHideAsync();
    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <Splash/>; 
  }

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            {AUTH_NAVIGATION.map((screen) => (
              <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
            ))}
          </>
        ) : (
          <>
            <Tab.Navigator
              initialRouteName={MAIN_ROUTES.HOME}
              screenOptions={{
                tabBarStyle: {
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                },
                tabBarActiveTintColor: theme === 'dark' ? '#fff' : '#000',
                tabBarInactiveTintColor: theme === 'dark' ? '#aaa' : '#888',
              }}
            >
              {TAB_NAVIGATION.map(({ name, icon, component }) => (
                <Tab.Screen
                  key={name}
                  name={name}
                  component={component}
                  options={{
                    tabBarIcon: ({ color }) => <Ionicons name={icon as any} size={24} color={color} />,
                  }}
                />
              ))}
            </Tab.Navigator>
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default Navigator;
