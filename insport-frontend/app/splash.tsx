// app/splash.tsx
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/themes/colors';
import { ScreenWrapper } from '@/components';

export default function Splash() {
  const backgroundColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.white }, 'white');


  return (
    <ScreenWrapper bg={backgroundColor}>
      <View style={styles.container}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
