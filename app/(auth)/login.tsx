import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter, Link } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SocialButton from "../../components/ui/SocialButton";
import { StatusBar } from "expo-status-bar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // For now, navigate to verification or Home
    router.push("/(auth)/verify");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 pt-12 pb-10 flex-1">
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <Feather name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>

          {/* Header */}
          <Text className="text-[#1a1a1a] text-4xl font-black uppercase leading-tight mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-lg mb-10">
            Log in to your ATR Guardian account.
          </Text>

          {/* Form */}
          <View>
            <Input
              label="Email Address"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity className="self-end mb-8">
              <Text className="text-[#D82C15] font-bold">Forgot Password?</Text>
            </TouchableOpacity>

            <Button title="LOG IN" onPress={handleLogin} />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-10">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-gray-400 font-bold text-sm uppercase">or</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* Social Logins */}
          <View className="flex-row gap-4 mb-10">
            <SocialButton type="google" onPress={() => {}} />
            <SocialButton type="apple" onPress={() => {}} />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-auto">
            <Text className="text-gray-500 text-lg">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-[#1a1a1a] font-black text-lg underline">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
