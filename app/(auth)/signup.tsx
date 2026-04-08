import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SocialButton from "../../components/ui/SocialButton";
import { StatusBar } from "expo-status-bar";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleSignup = () => {
    router.push("/(auth)/verify");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 pt-12 pb-10 flex-1">
          {/* Header Actions */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#1a1a1a" />
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
            />
            <Input
              label="Password"
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
            
            <TouchableOpacity 
              className="flex-row items-center mb-8"
              onPress={() => setAgreed(!agreed)}
            >
              <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${agreed ? 'bg-[#D82C15] border-[#D82C15]' : 'border-gray-300'}`}>
                {agreed && <Feather name="check" size={16} color="white" />}
              </View>
              <Text className="text-gray-500 flex-1">
                I agree to the <Text className="text-[#D82C15] font-bold">Terms of Service</Text> and <Text className="text-[#D82C15] font-bold">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button title="CREATE ACCOUNT" onPress={handleSignup} />
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
