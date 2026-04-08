import { View, Text, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Learn() {
  return (
    <SafeAreaView className="flex-1 bg-[#1a2634] items-center justify-center">
      <StatusBar style="light" />
      <Text className="text-white text-xl font-bold">Learn Module</Text>
    </SafeAreaView>
  );
}
