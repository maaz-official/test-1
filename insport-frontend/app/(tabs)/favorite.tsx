import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components';

const FavoriteScreen = () => {
  return (
    <ScreenWrapper bg={'white'}>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.content}>Here are your favorite items and content.</Text>
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

export default FavoriteScreen;
