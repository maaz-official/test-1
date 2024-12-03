import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@/types';
import { ScreenWrapper } from '@/components';

const ResetPasswordScreen = ({ route }: { route: RouteProp<AuthStackParamList, 'ResetPassword'> }) => {
  const { token } = route.params; // Token passed from navigation params
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    if (newPassword === confirmPassword) {
      // Implement the password reset logic here
      console.log('Password reset successful with token:', token);
    } else {
      console.log('Passwords do not match');
    }
  };

  return (
    <ScreenWrapper bg={'white'}>
      <Text style={styles.title}>Reset Password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <Button title="Reset Password" onPress={handleResetPassword} />
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
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default ResetPasswordScreen;
