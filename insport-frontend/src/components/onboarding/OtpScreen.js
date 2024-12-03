import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BorderRadii, Colors,Margin } from "../../theme/Theme.js";

export const OtpScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    // Simulate OTP verification (replace with your actual logic)
    if (otp === '123456') {
      setError('');
      const input = route.params.input; // Ensure this is defined
      navigation.navigate('InformationScreen', { input, otp }); // Pass input and otp to InformationScreen
    } else {
      setError('Invalid OTP, please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />
       {error ? <Text style={styles.error}>{error}</Text> : null}

{/* Custom Button */}
<TouchableOpacity style={styles.button} onPress={handleSubmit}>
  <Text>Submit</Text>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Set this to 1 for full height
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingBottom:20,
    margin:Margin.allPages,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: BorderRadii.medium,
    paddingHorizontal: 10,
    marginBottom: Margin.bottom,
    borderColor: '#A9A9A9',
  },
  button:{
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadii.medium,
    alignItems: 'center',
    
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
