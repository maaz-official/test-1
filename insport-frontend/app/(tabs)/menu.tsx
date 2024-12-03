import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components';

const MenuScreen = () => {
  return (
    <ScreenWrapper bg={'white'}>
      <Text style={styles.title}>Menu</Text>
      <Text style={styles.content}>Navigate through the app and manage your settings from here.</Text>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MenuScreen;
