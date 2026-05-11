import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../lib/api";
import { rf } from "../../utils/responsive";

type Step = "request" | "verify" | "reset";

export default function ForgotPassword() {
    const [step, setStep] = useState<Step>("request");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordResetToken, setPasswordResetToken] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<TextInput[]>([]);
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string }>();
    const { requestPasswordReset, verifyPasswordReset, resetPassword } = useAuth();

    useEffect(() => {
        if (typeof params.email === "string" && params.email) {
            setEmail(params.email);
        }
    }, [params.email]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text !== "" && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleRequest = async () => {
        setFormError(null);
        setInfoMessage(null);

        if (!email) {
            setFormError("Email is required.");
            return;
        }

        setLoading(true);
        try {
            await requestPasswordReset({ email });
            setStep("verify");
            setInfoMessage("Verification code sent.");
        } catch (error: unknown) {
            const apiError = error as ApiError;
            setFormError(apiError.message ?? "Unable to send reset code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setFormError(null);
        setInfoMessage(null);

        if (!email) {
            setFormError("Email is required.");
            return;
        }

        const codeValue = code.join("");
        if (codeValue.length !== 6) {
            setFormError("Enter the 6-digit code.");
            return;
        }

        setLoading(true);
        try {
            const token = await verifyPasswordReset({ email, code: codeValue });
            setPasswordResetToken(token);
            setStep("reset");
        } catch (error: unknown) {
            const apiError = error as ApiError;
            setFormError(apiError.message ?? "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setFormError(null);
        setInfoMessage(null);

        if (!email) {
            setFormError("Email is required.");
            return;
        }

        if (!passwordResetToken) {
            setFormError("Reset token is missing.");
            return;
        }

        if (!password || password.length < 8) {
            setFormError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({
                email,
                password_reset_token: passwordResetToken,
                new_password: password,
            });
            router.replace({ pathname: "/(auth)/login", params: { email } });
        } catch (error: unknown) {
            const apiError = error as ApiError;
            setFormError(apiError.message ?? "Unable to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="px-6 pt-12 pb-10 flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="mb-8">
                            <ArrowLeft size={24} color="#1a1a1a" />
                        </TouchableOpacity>

                        <Text className="text-[#1a1a1a] text-4xl font-black uppercase leading-tight mb-2">
                            RESET PASSWORD
                        </Text>
                        <Text className="text-gray-500 text-lg mb-10">
                            {step === "request"
                                ? "Enter your account email to receive a reset code."
                                : step === "verify"
                                    ? "Enter the 6-digit code sent to your email."
                                    : "Choose a new password for your account."}
                        </Text>

                        {formError ? (
                            <Text style={{ fontSize: rf(14) }} className="text-red-500 mb-4 font-semibold">
                                {formError}
                            </Text>
                        ) : null}
                        {infoMessage ? (
                            <Text style={{ fontSize: rf(14) }} className="text-green-600 mb-4 font-semibold">
                                {infoMessage}
                            </Text>
                        ) : null}

                        {step === "request" ? (
                            <View>
                                <Input
                                    label="Email Address"
                                    placeholder="you@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <Button title="SEND RESET CODE" onPress={handleRequest} loading={loading} />
                            </View>
                        ) : null}

                        {step === "verify" ? (
                            <View>
                                <View className="flex-row justify-between mb-10">
                                    {code.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => {
                                                if (ref) inputs.current[index] = ref;
                                            }}
                                            className="w-[50px] h-[65px] border-2 border-gray-300 rounded-lg text-center text-3xl font-black text-[#1a1a1a] bg-gray-50"
                                            maxLength={1}
                                            keyboardType="number-pad"
                                            value={digit}
                                            onChangeText={(text) => handleCodeChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                        />
                                    ))}
                                </View>
                                <Button title="VERIFY CODE" onPress={handleVerify} loading={loading} className="mb-6" />
                                <TouchableOpacity onPress={handleRequest}>
                                    <Text className="text-[#D82C15] font-black uppercase text-sm tracking-widest">
                                        RESEND CODE
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {step === "reset" ? (
                            <View>
                                <Input
                                    label="New Password"
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <Input
                                    label="Confirm Password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                                <Button title="RESET PASSWORD" onPress={handleReset} loading={loading} />
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
