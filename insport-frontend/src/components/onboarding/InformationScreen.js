import React, { useState } from 'react';
import { View,TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import { BorderRadii ,Colors,Margin} from '../../theme/Theme';

export const InformationScreen = ({ route, navigation }) => {
    // Using fallback values in case params are undefined
    const { input = '', otp = '' } = route.params || {};
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [email, setemail] = useState('');

    const handleNext = () => {
        // Navigate to Create Password screen
        navigation.navigate('CreatePasswordScreen', { input, otp, name });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter your information</Text>
            <TextInput 
                style={styles.input}
                placeholder="First Name" 
                value={firstName}
                onChangeText={setfirstName} 
            />
            <TextInput 
                style={styles.input}
                placeholder="Last Name" 
                value={lastName}
                onChangeText={setlastName} 
            />
            <TextInput 
                style={styles.input}
                placeholder="Email" 
                value={email}
                onChangeText={setemail} 
            />
            <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: Colors.background,
        margin:Margin.allPages,
        borderRadius:BorderRadii.medium,
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
});
