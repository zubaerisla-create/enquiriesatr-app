import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Button from "../../components/ui/Button";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../lib/api";
import { rf } from "../../utils/responsive";

export default function Verify() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { verifyEmailCode, resendCode } = useAuth();

  useEffect(() => {
    if (typeof params.email === "string") {
      setEmail(params.email);
    }
  }, [params.email]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text !== "" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
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
      await verifyEmailCode({ email, code: codeValue });
      router.replace({ pathname: "/(auth)/login", params: { email } });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setFormError(apiError.message ?? "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || resendLoading) {
      return;
    }

    setFormError(null);
    setInfoMessage(null);
    setResendLoading(true);
    try {
      await resendCode({ email });
      setInfoMessage("A new code has been sent.");
      setCooldown(60);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setFormError(apiError.message ?? "Unable to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `(${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")})`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="px-6 pt-12 pb-10 flex-1">
          {/* Header Actions */}
          <View className="flex-row items-center justify-between mb-12">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <Text className="text-[#1a1a1a] font-black text-sm uppercase tracking-widest">AUTHENTICATION</Text>
            <Text className="text-[#1a1a1a] font-black text-sm uppercase">ATR</Text>
          </View>

          {/* Header */}
          <Text className="text-[#1a1a1a] text-6xl font-black uppercase leading-none mb-4">
            VERIFY_IDENTITY
          </Text>
          <Text className="text-gray-500 text-xl leading-relaxed mb-12">
            Enter the 6-digit code sent to your registered operative email.
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

          {/* OTP Inputs */}
          <View className="flex-row justify-between mb-12">
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

          <Button
            title="VERIFY & CONTINUE"
            onPress={handleVerify}
            loading={loading}
            className="mb-8"
          />

          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || resendLoading}>
              <Text className={`text-[#D82C15] font-black uppercase text-sm tracking-widest ${cooldown > 0 ? "opacity-60" : ""}`}>
                RESEND CODE
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-400 font-bold uppercase text-sm">
              {cooldown > 0 ? formatCooldown(cooldown) : ""}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
