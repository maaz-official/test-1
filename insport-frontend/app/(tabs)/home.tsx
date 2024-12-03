import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components';

const HomeScreen = () => {
  return (
    <ScreenWrapper bg={'white'}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.content}>Welcome to the Home screen! Explore and navigate through your content here.</Text>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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

export default HomeScreen;