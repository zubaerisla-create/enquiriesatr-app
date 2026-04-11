import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const LESSONS = [
  { id: "01", title: "Understanding Threat Levels", time: "30 min", status: "complete" },
  { id: "02", title: "Surveillance Detection Routes", time: "32 min", status: "complete" },
  { id: "03", title: "Counter-Surveillance Techniques", time: "28 min", status: "complete" },
  { id: "04", title: "Hostile Reconnaissance Awareness", time: "25 min", status: "complete" },
];

export default function ThreatAssessmentDetails() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Dark Header */}
      <View className="bg-[#111824] pt-14 pb-8 px-5 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
          <Feather name="arrow-left" size={20} color="#9ca3af" />
          <Text className="text-gray-400 font-medium ml-2  text-base">Modules</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-4">
            <View className="border border-[#F97316]/30 bg-[#F97316]/10 px-3 py-1 rounded-full self-start mb-3">
              <Text className="text-[#F97316] text-[10px] font-bold tracking-widest uppercase">TACTICAL</Text>
            </View>
            <Text className="text-white  text-[28px] font-black uppercase tracking-wider mb-2 leading-8">
              Threat Assessment
            </Text>
            <Text className="text-gray-400 text-sm leading-6 mb-4">
              Systematic evaluation of threats, vulnerabilities and risk matrices to protect the principal at all times.
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Feather name="clock" size={14} color="#9ca3af" />
                <Text className="text-gray-400 text-xs font-mono">1h 55m</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Feather name="check-circle" size={14} color="#9ca3af" />
                <Text className="text-gray-400 text-xs font-mono">4/4 lessons</Text>
              </View>
            </View>
          </View>

          {/* 100% Progress Ring */}
          <View className="w-20 h-20 rounded-full border-[3px] border-[#D82C15] bg-[#2D1A1E] items-center justify-center">
            <Text className="text-white font-bold text-lg">100%</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-8">
          <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4">LESSONS</Text>

          {LESSONS.map(lesson => (
            <View key={lesson.id} className="bg-[#131C2E] rounded-2xl px-5 py-4 mb-3 flex-row items-center">
              <View className="flex-1 flex-row items-center gap-4">
                <Text className="text-gray-400 font-mono text-xs">{lesson.id}</Text>
                <View>
                  <Text className="text-white font-medium text-base mb-1">{lesson.title}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-400 font-mono text-[10px]">{lesson.time}</Text>
                    <Text className="text-[#059669] font-mono text-[10px] ml-1">✓ Complete</Text>
                  </View>
                </View>
              </View>
              <Feather name="check-circle" size={18} color="#059669" />
            </View>
          ))}

          <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-6 mb-4">MODULE ASSESSMENT</Text>

          <View className="bg-[#111824] rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-xl bg-[#2D1A1E] items-center justify-center">
                <Feather name="target" size={24} color="#D82C15" />
              </View>
              <View>
                <Text className="text-white font-semibold text-base mb-1">Threat Assessment Quiz</Text>
                <Text className="text-gray-400 font-mono text-[10px]">5 questions · Pass mark: 70%</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/threat-assessment-intro")}
              className="bg-[#D82C15] px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-bold text-sm">Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 w-full bg-white px-5 py-6 pt-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => router.push("/threat-assessment-checklist")}
          className="w-full bg-[#D82C15] py-4 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-bold tracking-wide uppercase text-sm">CONTINUE MODULE</Text>
          <Feather name="chevron-right" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
