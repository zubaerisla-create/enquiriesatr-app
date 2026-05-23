import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ArrowLeft,
  Target,
  ChevronRight
} from "lucide-react-native";
import { AnimatedPage } from "../components/ui";

export default function ThreatAssessmentIntro() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <AnimatedPage>

      {/* Header */}
      <View className="px-5 pt-12 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-[#1f2937]  font-medium ml-2 text-base">Threat Assessment</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 items-center">
          {/* Icon Box */}
          <View className="w-24 h-24 rounded-2xl bg-[#FFE4E1] items-center justify-center mb-6 border border-[#FCA5A5]/30">
            <Target size={40} color="#D82C15" />
          </View>

          {/* Badge */}
          <View className="border border-[#FCA5A5] bg-[#FFF0F0] px-4 py-1.5 rounded-full mb-4">
            <Text className="text-[#D82C15] text-[10px] font-extrabold tracking-widest uppercase">
              TACTICAL ASSESSMENT
            </Text>
          </View>

          <Text className="text-[#131C2E] text-2xl font-black uppercase text-center mb-4">
            Threat Assessment Quiz
          </Text>

          <Text className="text-gray-400 text-center text-sm leading-6 mb-8 px-4">
            Demonstrate your knowledge of the threat assessment process, vulnerability analysis, and risk management.
          </Text>

          {/* Stat Cards */}
          <View className="flex-row gap-3 mb-8 w-full">
            <View className="flex-1 bg-[#131C2E] rounded-xl p-4 items-center">
              <Text className="text-[#D82C15] font-bold text-lg mb-1">5</Text>
              <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">QUESTIONS</Text>
            </View>
            <View className="flex-1 bg-[#131C2E] rounded-xl p-4 items-center">
              <Text className="text-[#F5A623] font-bold text-lg mb-1">70%</Text>
              <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">PASS MARK</Text>
            </View>
            <View className="flex-1 bg-[#131C2E] rounded-xl p-4 items-center">
              <Text className="text-[#4CAF50] font-bold text-lg mb-1">No limit</Text>
              <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">TIME</Text>
            </View>
          </View>

          {/* Instruction Box */}
          <View className="bg-[#131C2E] rounded-xl p-5 w-full">
            <Text className="text-gray-300 text-sm leading-6">
              <Text className="text-white font-bold">Before you begin: </Text>
              Each question has one correct answer. You'll receive immediate feedback after each answer, with an explanation. You can retake the assessment if you don't pass.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-10 w-full bg-white px-5 py-6">
        <TouchableOpacity
          onPress={() => router.push("/assessment/quiz")}
          className="w-full bg-[#D82C15] py-4 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-bold tracking-wide uppercase text-sm">START ASSESSMENT</Text>
          <ChevronRight size={18} color="white" />
        </TouchableOpacity>
      </View>
      </AnimatedPage>
    </SafeAreaView>
  );
}
