import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/themes/colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ScreenWrapper } from '@/components';

const logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Logged Error:', error, errorInfo);
};

interface ErrorProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorProps> = ({ error, resetErrorBoundary }) => {
  const { back } = useRouter();
  const backgroundColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.white }, 'white');
  const textColor = useThemeColor({ light: Colors.light.raisinBlack, dark: Colors.dark.white }, 'raisinBlack');

  React.useEffect(() => {
    logErrorToService(error, {} as React.ErrorInfo);
  }, [error]);

  return (
    <ScreenWrapper bg='white'>
      <Text style={[styles.title, { color: textColor }]}>Something went wrong!</Text>
      <Text style={[styles.message, { color: textColor }]}>{error.message}</Text>
      <Button title="Go Back" onPress={() => back()} />
      <Button title="Try Again" onPress={resetErrorBoundary} />
    </ScreenWrapper>
  );
};

export default ErrorFallback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});
