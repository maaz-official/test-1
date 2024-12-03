// app/_layout.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@gluestack-ui/toast';
import ThemeProvider from '../themes/ThemeProvider';
import Navigator from '../navigation/Navigator';
import { StatusBar } from 'expo-status-bar';
import useAppStore from '../state/store';
import { Slot } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Root() {
  const { theme } = useAppStore();
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ToastProvider>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              <Navigator />
            </ToastProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
