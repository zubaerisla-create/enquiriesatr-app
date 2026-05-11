import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { ArrowLeft, Check } from "lucide-react-native";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SocialButton from "../../components/ui/SocialButton";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../lib/api";
import { isGoogleSignInCancelled, signInWithGoogle, signOutFromGoogle } from "../../lib/googleAuth";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [agreementError, setAgreementError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const router = useRouter();
  const { register, loginWithGoogle, loginWithApple } = useAuth();

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    let isMounted = true;
    AppleAuthentication.isAvailableAsync().then((available: boolean) => {
      if (isMounted) {
        setAppleAvailable(available);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignup = async () => {
    setFormError(null);
    setEmailError(undefined);
    setPasswordError(undefined);
    setConfirmError(undefined);
    setAgreementError(null);

    let hasError = false;
    if (!email) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    }
    if (confirmPassword !== password) {
      setConfirmError("Passwords do not match.");
      hasError = true;
    }
    if (!agreed) {
      setAgreementError("You must agree to continue.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      await register({ email, password, full_name: fullName });
      router.push({ pathname: "/(auth)/verify", params: { email } });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const fields = (apiError.extra as { fields?: Record<string, unknown> } | undefined)?.fields;

      if (fields && typeof fields === "object") {
        const getFirstError = (value: unknown) => {
          if (Array.isArray(value)) {
            return value[0] ? String(value[0]) : undefined;
          }
          if (value) {
            return String(value);
          }
          return undefined;
        };

        const emailField = getFirstError((fields as Record<string, unknown>).email);
        const passwordField = getFirstError((fields as Record<string, unknown>).password);

        if (emailField) {
          setEmailError(emailField);
        }
        if (passwordField) {
          setPasswordError(passwordField);
        }
      }

      setFormError(apiError.message ?? "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || socialLoading) {
      return;
    }
    setFormError(null);
    setSocialLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      await loginWithGoogle({ id_token: idToken });
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (!isGoogleSignInCancelled(error)) {
        const apiError = error as ApiError;
        setFormError(apiError.message ?? "Google sign-in failed.");
        // Sign out so user can pick a different account next time
        await signOutFromGoogle();
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (loading || socialLoading) {
      return;
    }
    if (!appleAvailable) {
      setFormError("Apple sign-in is not available.");
      return;
    }

    setFormError(null);
    setSocialLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setFormError("Apple sign-in did not return a token.");
        return;
      }

      const fullNameValue = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" ");

      await loginWithApple({ id_token: credential.identityToken, full_name: fullNameValue });
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code !== "ERR_CANCELED") {
        setFormError("Apple sign-in failed.");
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 pt-12 pb-10 flex-1">
          {/* Header Actions */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <View className="h-1 w-12 bg-[#D82C15] rounded-full" />
          </View>

          {/* Header */}
          <Text className="text-[#1a1a1a] text-4xl font-black uppercase leading-tight mb-2">
            Create Your Account
          </Text>
          <Text className="text-gray-500 text-lg mb-8">
            Join thousands of CP professionals on CPTAN.
          </Text>

          {/* Form */}
          <View>
            {formError ? (
              <Text className="text-red-500 text-sm font-semibold mb-4">
                {formError}
              </Text>
            ) : null}
            <Input
              label="Full Name"
              placeholder="James Harwick"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label="Email Address"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            <Input
              label="Password"
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
            />
            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={confirmError}
            />

            <TouchableOpacity
              className="flex-row items-center mb-8"
              onPress={() => setAgreed(!agreed)}
            >
              <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${agreed ? 'bg-[#D82C15] border-[#D82C15]' : 'border-gray-300'}`}>
                {agreed && <Check size={16} color="white" />}
              </View>
              <Text className="text-gray-500 flex-1">
                I agree to the <Text className="text-[#D82C15] font-bold">Terms of Service</Text> and <Text className="text-[#D82C15] font-bold">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {agreementError ? (
              <Text className="text-red-500 text-sm font-semibold mb-4">
                {agreementError}
              </Text>
            ) : null}

            <Button title="CREATE ACCOUNT" onPress={handleSignup} loading={loading} />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-10">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-gray-400 font-bold text-sm uppercase">or</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* Social Logins */}
          <View className="flex-row gap-4 mb-10">
            <SocialButton type="google" onPress={handleGoogleLogin} />
            {appleAvailable ? (
              <SocialButton type="apple" onPress={handleAppleLogin} />
            ) : null}
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-auto">
            <Text className="text-gray-500 text-lg">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-[#D82C15] font-black text-lg underline">Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
