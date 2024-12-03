import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BorderRadii ,Colors,Margin} from '../../theme/Theme';
// import Footer from './Footer';
// import { useAuth } from '../AuthContext';

export const CreatePasswordScreen = ({ route, navigation }) => {
  // const { isLoggedIn } = useAuth();
  const { input = '', otp = '', name = '' } = route.params || {}; // Default values to prevent destructuring errors
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Basic password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    // Handle account creation logic here
    console.log('Account created for:', { input, otp, name, password });
    Alert.alert('Success', 'Account created successfully!'); // Show success message

    // Navigate to the home page
    navigation.navigate('HomePage'); // This should match the name in MainStack
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Password</Text>
      <TextInput 
        style={styles.input}
        placeholder="Password" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword} 
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text>Submit</Text>
            </TouchableOpacity>
            {/* {isLoggedIn && <Footer />} Conditional footer rendering */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius:BorderRadii.medium,
    margin:Margin.allPages,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  button:{
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadii.medium,
    alignItems: 'center',
    
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
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
