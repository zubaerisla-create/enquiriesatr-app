import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Check } from "lucide-react-native";

export default function ToolComplete() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-24 h-24 rounded-full bg-[#E8F5E9] border-2 border-[#4CAF50] items-center justify-center mb-6">
          <View className="w-12 h-12 rounded-full border-[3px] border-[#4CAF50] items-center justify-center">
            <Check size={24} color="#4CAF50" strokeWidth={3} />
          </View>
        </View>

        {/* Text */}
        <Text className="text-2xl font-black text-[#1a1a1a] mb-2 uppercase tracking-wide">
          Operation Complete
        </Text>
        <Text className="text-gray-400 text-sm mb-12">
          3/14 steps completed
        </Text>

        {/* Done Button */}
        <TouchableOpacity 
          onPress={() => router.navigate("/tools")}
          className="w-full bg-[#D82C15] py-4 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-bold text-base">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
