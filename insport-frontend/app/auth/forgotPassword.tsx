import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor'; 
import { ScreenWrapper } from '@/components';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const colors = useThemeColor({ light: '#fff', dark: '#333' }, 'white');

  const handleSubmit = () => {
    console.log('Password reset request for email:', email);
  };

  return (
    <ScreenWrapper bg={'white'}>
      <Text style={[styles.title, { color: colors === '#fff' ? '#000' : '#fff' }]}>Forgot Password</Text>
      
      <TextInput
        style={[styles.input, { borderColor: colors === '#fff' ? '#000' : '#fff' }]}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <Button title="Submit" onPress={handleSubmit} />
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
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default ForgotPasswordScreen;
