import * as React from "react";
import { StyleSheet } from "react-nativescript";
import { AuthService } from "../../services/api/authApi";

export function PhoneInput({ onSuccess }: { onSuccess: (token: string) => void }) {
    const [phone, setPhone] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");
            const { token } = await AuthService.requestOtp(phone);
            onSuccess(token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <flexboxLayout style={styles.container}>
            <label className="text-xl mb-4 font-bold">Enter Your Phone Number</label>
            <textField
                style={styles.input}
                hint="Phone number"
                keyboardType="phone"
                text={phone}
                onTextChange={(e) => setPhone(e.value)}
            />
            {error && <label style={styles.error}>{error}</label>}
            <button
                style={styles.button}
                onTap={handleSubmit}
                isEnabled={!loading}
            >
                {loading ? "Sending..." : "Send OTP"}
            </button>
        </flexboxLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        padding: 20,
        gap: 10,
    },
    input: {
        fontSize: 18,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
    },
    button: {
        fontSize: 18,
        padding: 10,
        backgroundColor: "#2e6ddf",
        color: "white",
        borderRadius: 5,
        marginTop: 10,
    },
    error: {
        color: "red",
        fontSize: 14,
    },
});