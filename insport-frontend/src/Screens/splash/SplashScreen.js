import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import tw from 'twrnc'; // Import tailwind class

const SplashScreen = () => {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Image
        source={require('../../../assets/images/splash.svg')} // Replace with your splash image
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={tw`mt-4 text-xl font-bold text-gray-800`}>Welcome to InSport!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 200, // Adjust the size as needed
    height: 200,
  },
});

export default SplashScreen;
