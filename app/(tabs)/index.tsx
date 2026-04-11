import React from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle } from "react-native-svg";
import { router, useRouter } from "expo-router";

interface CircularProgressProps {
  progress: number;
  total: number;
  title: string;
  subtitle: string;
  color?: string;
}

export default function Home() {
  const CircularProgress = ({ progress, total, title, subtitle, color = "#D82C15" }: CircularProgressProps) => {
    const size = 80;
    const strokeWidth = 6;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / total) * circumference;
    const router  = useRouter();

    return (
      <View className="items-center">
        <View className="relative items-center justify-center mb-2" style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Circle
              stroke="#2e3c4b"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {progress > 0 && (
              <Circle
                stroke={color}
                cx={center}
                cy={center}
                r={radius}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            )}
          </Svg>
          <View className="absolute items-center justify-center">
            {title === "Day Streak" ? (
              <Feather name="zap" size={20} color={color} />
            ) : (
              <View className="flex-row items-baseline">
                <Text className="text-white font-bold text-lg">{progress}</Text>
                {title !== "Day Streak" && total !== 100 && (
                  <Text className="text-gray-400 text-xs ml-1">/{total}</Text>
                )}
              </View>
            )}
            {title === "Day Streak" && (
              <Text className="text-white font-bold mt-1 text-sm">{progress}</Text>
            )}
          </View>
        </View>
        <Text className="text-gray-400 text-xs">{subtitle}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 pt-16 py-4 flex-row justify-between items-center z-10 bg-white">
        <View className="flex-row items-center">
          <Text className="text-4xl font-black italic tracking-tighter text-[#1a1a1a]">AT<Text className="text-[#D82C15]">R</Text></Text>
          <View className="ml-1 justify-center mt-1">
            <Text className="text-[6px] font-bold text-gray-500 uppercase leading-none">Advanced Tactical</Text>
            <Text className="text-[6px] font-bold text-gray-500 uppercase leading-none">Resources</Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={()=> router.push("/notifications")} className="relative">
            <Feather name="bell" size={24} color="#1a1a1a" />
            <View className="absolute -top-1 -right-1 bg-[#D82C15] rounded-full w-4 h-4 items-center justify-center border border-white">
              <Text className="text-white text-[9px] font-bold">3</Text>
            </View>
          </TouchableOpacity>


          <TouchableOpacity onPress={()=> router.push("/profile")} className="w-10 h-10 bg-[#D82C15] rounded-full items-center justify-center">
            <Text className="text-white font-bold tracking-widest text-sm">JH</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
        
        {/* Content */}
        <View className="px-6 pb-10">
          
          {/* Continue Learning */}
          <View className="bg-[#1e2a38] rounded-2xl p-5 mb-8 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Continue Learning</Text>
              <View className="border border-yellow-600/30 bg-yellow-600/10 px-2 py-1 rounded-full">
                <Text className="text-yellow-500 text-[10px] font-bold uppercase">Foundation</Text>
              </View>
            </View>
            
            <Text className="text-white text-2xl font-black mb-1 tracking-tight">CP Fundamentals</Text>
            <Text className="text-gray-400 mb-6">Threat & Risk Assessment</Text>
            
            <View className="flex-row items-center mb-5 gap-3">
              <View className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <View className="h-full bg-[#D82C15] w-[68%]" />
              </View>
              <Text className="text-gray-400 text-xs font-bold">68%</Text>
            </View>
            
            <TouchableOpacity onPress={()=>router.push("/threat-assessment-checklist")} className="bg-[#D82C15] w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-red-500/20 active:opacity-80">
              <Text className="text-white font-bold uppercase tracking-wider mr-2">Continue</Text>
              <Feather name="chevron-right" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick Access */}
          <View className="mb-8">
            <Text className="text-[#1a1a1a] text-xs font-black tracking-widest uppercase mb-4 opacity-80">Quick Access</Text>
            
            {/* Grid 2x2 */}
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity onPress={()=>router.push("/(tabs)/learn")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View className="w-10 h-10 bg-red-500/10 rounded-xl items-center justify-center mb-4 border border-red-500/20">
                  <Feather name="book-open" size={20} color="#ef4444" />
                </View>
                <Text className="text-white font-bold text-base">Learn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={()=>router.push("/(tabs)/gradian")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View className="w-10 h-10 bg-yellow-500/10 rounded-xl items-center justify-center mb-4 border border-yellow-500/20">
                  <MaterialCommunityIcons name="robot-outline" size={22} color="#eab308" />
                </View>
                <Text className="text-white font-bold text-base">AI Assistant</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={()=>router.push("/(tabs)/tools")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View className="w-10 h-10 bg-teal-500/10 rounded-xl items-center justify-center mb-4 border border-teal-500/20">
                  <Feather name="check-square" size={20} color="#14b8a6" />
                </View>
                <Text className="text-white font-bold text-base">Tools</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={()=>router.push("/(tabs)/profile/my-notes")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center mb-4 border border-blue-500/20">
                  <Feather name="file-text" size={20} color="#3b82f6" />
                </View>
                <Text className="text-white font-bold text-base">My Notes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Your Progress */}
          <View className="mb-8">
            <Text className="text-[#1a1a1a] text-xs font-black tracking-widest uppercase mb-4 opacity-80">Your Progress</Text>
            <View className="bg-[#1e2a38] rounded-2xl p-6 flex-row justify-between items-center shadow-sm">
              <CircularProgress progress={12} total={27} title="12" subtitle="Lessons" />
              <CircularProgress progress={1} total={6} title="1" subtitle="Modules" color="#eab308" />
              <CircularProgress progress={7} total={100} title="Day Streak" subtitle="Day Streak" />
            </View>
          </View>

          {/* New Module Banner */}
          <TouchableOpacity onPress={()=> router.push("/lesson")} className="bg-[#1c2431] rounded-2xl p-5 flex-row items-center border border-gray-800 shadow-sm active:opacity-80">
            <View className="w-12 h-12 bg-yellow-600/20 rounded-xl items-center justify-center mr-4 border border-yellow-600/30">
              <MaterialCommunityIcons name="medal-outline" size={24} color="#eab308" />
            </View>
            <View className="flex-1 mr-2">
              <Text className="text-white font-bold text-sm mb-1 leading-tight">New: Specialist Operations Module</Text>
              <Text className="text-gray-400 text-xs">5 lessons • 3h 00m • Now available</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
