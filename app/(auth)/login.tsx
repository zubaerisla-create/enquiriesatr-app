import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { ArrowLeft } from "lucide-react-native";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SocialButton from "../../components/ui/SocialButton";
import { StatusBar } from "expo-status-bar";
import { rs, rf } from "../../utils/responsive";
import { useAuth } from "../../hooks/useAuth";
import type { ApiError } from "../../lib/api";
import { isGoogleSignInCancelled, signInWithGoogle, signOutFromGoogle } from "../../lib/googleAuth";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { login, loginWithGoogle, loginWithApple } = useAuth();

  useEffect(() => {
    if (typeof params.email === "string" && params.email) {
      setEmail(params.email);
    }
  }, [params.email]);

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

  const handleLogin = async () => {
    Keyboard.dismiss();
    setFormError(null);
    setEmailError(undefined);
    setPasswordError(undefined);

    let hasError = false;
    if (!email) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }
    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const extra = apiError.extra as { is_email_verified?: boolean } | undefined;
      if (extra?.is_email_verified === false) {
        router.push({ pathname: "/(auth)/verify", params: { email } });
        return;
      }
      setFormError(apiError.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push({ pathname: "/(auth)/forgot-password", params: { email } });
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
        setFormError(apiError.message ?? "Google sign-in failed. Please try again.");
        
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

      const fullName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" ");

      await loginWithApple({ id_token: credential.identityToken, full_name: fullName });
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
        <View className="px-6 pb-10 flex-1">
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <ArrowLeft size={rs(24)} color="#1a1a1a" />
          </TouchableOpacity>


          {/* Header */}
          <Text
            style={{ fontSize: rf(36) }}
            className="text-dark font-black uppercase leading-tight mb-2"
          >
            Welcome Back
          </Text>
          <Text
            style={{ fontSize: rf(18) }}
            className="text-gray-500 mb-8"
          >
            Log in to your ATR Guardian account.
          </Text>


          {/* Form */}
          <View>
            {formError ? (
              <Text style={{ fontSize: rf(14) }} className="text-red-500 mb-4 font-semibold">
                {formError}
              </Text>
            ) : null}
            <Input
              label="Email Address"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
            />

            <TouchableOpacity className="self-end mb-8" onPress={handleForgotPassword}>
              <Text style={{ fontSize: rf(14) }} className="text-primary font-bold">Forgot Password?</Text>
            </TouchableOpacity>


            <Button title="LOG IN" onPress={handleLogin} loading={loading} />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text style={{ fontSize: rf(12) }} className="mx-4 text-gray-400 font-bold uppercase">or</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />

          </View>

          {/* Social Logins */}
          <View className="flex-row gap-4 mb-8">
            <SocialButton type="google" onPress={handleGoogleLogin} />
            {appleAvailable ? (
              <SocialButton type="apple" onPress={handleAppleLogin} />
            ) : null}
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-auto">
            <Text style={{ fontSize: rf(16) }} className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={{ fontSize: rf(16) }} className="text-dark font-black underline">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
