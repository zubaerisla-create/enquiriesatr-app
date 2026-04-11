import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Button from "../../components/ui/Button";
import { StatusBar } from "expo-status-bar";

export default function Verify() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();

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

  const handleVerify = () => {
    // Navigate to home/success
    
    router.replace("/(tabs)");
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
            className="mb-8"
          />

          <View className="flex-row justify-between items-center">
            <TouchableOpacity>
              <Text className="text-[#D82C15] font-black uppercase text-sm tracking-widest">RESEND CODE</Text>
            </TouchableOpacity>
            <Text className="text-gray-400 font-bold uppercase text-sm">(02:59)</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
