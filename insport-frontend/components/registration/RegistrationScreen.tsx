import * as React from "react";
import { StyleSheet } from "react-nativescript";
import { PhoneInput } from "./PhoneInput";
import { OtpVerification } from "./OtpVerification";
import { RegistrationForm } from "./RegistrationForm";

enum RegistrationStep {
    PHONE_INPUT,
    OTP_VERIFICATION,
    REGISTRATION
}

export function RegistrationScreen({ navigation }: any) {
    const [step, setStep] = React.useState(RegistrationStep.PHONE_INPUT);
    const [phone, setPhone] = React.useState("");
    const [token, setToken] = React.useState("");

    const handlePhoneSuccess = (token: string) => {
        setToken(token);
        setStep(RegistrationStep.OTP_VERIFICATION);
    };

    const handleOtpSuccess = (verificationToken: string) => {
        setToken(verificationToken);
        setStep(RegistrationStep.REGISTRATION);
    };

    const handleRegistrationSuccess = ({ user, token }: { user: any, token: string }) => {
        // Handle successful registration (e.g., store token, navigate to home)
        navigation.navigate("One");
    };

    return (
        <flexboxLayout style={styles.container}>
            {step === RegistrationStep.PHONE_INPUT && (
                <PhoneInput onSuccess={handlePhoneSuccess} />
            )}
            
            {step === RegistrationStep.OTP_VERIFICATION && (
                <OtpVerification 
                    phone={phone}
                    onSuccess={handleOtpSuccess}
                />
            )}
            
            {step === RegistrationStep.REGISTRATION && (
                <RegistrationForm
                    phone={phone}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </flexboxLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
});