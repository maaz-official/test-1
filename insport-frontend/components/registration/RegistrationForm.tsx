import * as React from "react";
import { StyleSheet } from "react-nativescript";
import { AuthService, RegistrationData } from "../../services/api/authApi";

export function RegistrationForm({ 
    phone,
    onSuccess 
}: { 
    phone: string;
    onSuccess: (data: { user: any, token: string }) => void;
}) {
    const [formData, setFormData] = React.useState<Partial<RegistrationData>>({
        phone,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await AuthService.register(formData as RegistrationData);
            onSuccess(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof RegistrationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <scrollView>
            <flexboxLayout style={styles.container}>
                <label className="text-xl mb-4 font-bold">Complete Your Profile</label>
                
                <textField
                    style={styles.input}
                    hint="First Name"
                    text={formData.firstName}
                    onTextChange={(e) => updateField("firstName", e.value)}
                />
                
                <textField
                    style={styles.input}
                    hint="Last Name"
                    text={formData.lastName}
                    onTextChange={(e) => updateField("lastName", e.value)}
                />
                
                <textField
                    style={styles.input}
                    hint="Email (optional)"
                    keyboardType="email"
                    text={formData.email}
                    onTextChange={(e) => updateField("email", e.value)}
                />
                
                <textField
                    style={styles.input}
                    hint="Password"
                    secure={true}
                    text={formData.password}
                    onTextChange={(e) => updateField("password", e.value)}
                />
                
                {error && <label style={styles.error}>{error}</label>}
                
                <button
                    style={styles.button}
                    onTap={handleSubmit}
                    isEnabled={!loading}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>
            </flexboxLayout>
        </scrollView>
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