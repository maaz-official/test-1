import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import { useAuth } from '../../authContext/AuthProvider.js';
// import Footer from '../../components/onboarding/Footer.js';

const HomeScreen = () => {

  // const { isLoggedIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Page!</Text>
      <Text style={styles.subtitle}>Explore our features and enjoy your stay!</Text>
      {/* {isLoggedIn && <Footer />} Conditional footer rendering */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light background color for the home screen
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d', // Gray color for subtitle
  },
});

export default HomeScreen;
