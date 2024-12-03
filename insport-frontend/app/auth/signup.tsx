import React, { FC, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@/assets/icons';  // Assuming this is a custom icon component
import { BackButton, Button, ScreenWrapper } from '@/components';  // Assuming custom components
import { theme } from '@/constants';
import { hp, wp } from '@/helpers';
import { defineAnimation } from 'react-native-reanimated';

enum RegistrationStep {
    PHONE_INPUT,
    OTP_VERIFICATION,
    REGISTRATION
}

function ScreenOne({ navigation }: ScreenOneProps) {
    const [step, setStep] = useState(RegistrationStep.PHONE_INPUT);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const handlePhoneSubmit = async () => {
        try {
            if (!phone) {
                Alert.alert("Please enter your phone number");
                return;
            }
            setLoading(true);
            setError("");
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStep(RegistrationStep.OTP_VERIFICATION);
        } catch (err: any) {
            setError(err.message);
            Alert.alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        try {
            if (!otp) {
                Alert.alert("Please enter the OTP");
                return;
            }
            setLoading(true);
            setError("");
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStep(RegistrationStep.REGISTRATION);
        } catch (err: any) {
            setError(err.message);
            Alert.alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationSubmit = async () => {
        try {
            if (!formData.firstName || !formData.lastName || !formData.password) {
                Alert.alert("Please fill in all required fields");
                return;
            }
            setLoading(true);
            setError("");
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigation.navigate("Two", { message: "Registration successful!" });
        } catch (err: any) {
            setError(err.message);
            Alert.alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderPhoneInput = () => (
        <View style={styles.container}>
            <BackButton router={navigation} />
            <Text style={styles.welcomeText}>Let's</Text>
            <Text style={styles.welcomeText}>Get Started</Text>
            <Text style={styles.subtitle}>
                Enter your phone number to continue
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />
            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePhoneSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Sending..." : "Continue"}
                </Text>
            </Pressable>
        </View>
    );

    const renderOtpVerification = () => (
        <View style={styles.container}>
            <BackButton router={navigation} />
            <Text style={styles.welcomeText}>Verify Your</Text>
            <Text style={styles.welcomeText}>Phone Number</Text>
            <Text style={styles.subtitle}>
                Enter the code sent to {phone}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
            />
            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleOtpSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Verifying..." : "Verify OTP"}
                </Text>
            </Pressable>
        </View>
    );

    const renderRegistrationForm = () => (
        <ScrollView style={styles.container}>
            <BackButton router={navigation} />
            <Text style={styles.welcomeText}>Complete</Text>
            <Text style={styles.welcomeText}>Your Profile</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            />
            <TextInput
                style={styles.input}
                placeholder="Email (optional)"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            />
            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegistrationSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Creating Account..." : "Create Account"}
                </Text>
            </Pressable>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {step === RegistrationStep.PHONE_INPUT && renderPhoneInput()}
            {step === RegistrationStep.OTP_VERIFICATION && renderOtpVerification()}
            {step === RegistrationStep.REGISTRATION && renderRegistrationForm()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: wp(5),
        gap: hp(2),
        backgroundColor: "white",
    },
    welcomeText: {
        color: theme.colors.text,
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
    },
    subtitle: {
        color: theme.colors.text,
        fontSize: hp(1.5),
        marginTop: hp(1),
        marginBottom: hp(2),
    },
    input: {
        fontSize: hp(2),
        padding: hp(1.5),
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: wp(1),
        marginBottom: hp(1),
        backgroundColor: "white",
    },
    button: {
        padding: hp(1.5),
        backgroundColor: theme.colors.primary,
        borderRadius: wp(1),
        textAlign: "center",
        marginTop: hp(2),
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "white",
        fontSize: hp(2),
        textTransform: "uppercase",
        fontWeight: theme.fonts.semibold,
    },
    error: {
        color: theme.colors.error,
        fontSize: hp(1.4),
        textAlign: "center",
    },
});



export default ScreenOne