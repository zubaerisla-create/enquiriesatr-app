import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { router, useRouter } from "expo-router";
import {
  Flame,
  Bell,
  ChevronRight,
  BookOpen,
  Sparkles,
  CheckSquare,
  FileText,
  Trophy
} from "lucide-react-native";
import { rs, rf } from "../../utils/responsive";
import { useQuery } from "@tanstack/react-query";
import { fetchModules, fetchModuleProgress } from "../../lib/modules";
import { fetchUnreadCount } from "../../lib/notifications";
import { fetchUserStats } from "../../lib/stats";

interface CircularProgressProps {
  progress: number;
  total: number;
  title: string;
  subtitle: string;
  color?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  FOUNDATION: "#3B82F6",
  TACTICAL: "#F97316",
  OPERATIONS: "#22C55E",
  LEGAL: "#A855F7",
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "TACTICAL":
      return { borderBg: "border-orange-600/30 bg-orange-600/10", text: "text-orange-500" };
    case "OPERATIONS":
      return { borderBg: "border-green-600/30 bg-green-600/10", text: "text-green-500" };
    case "LEGAL":
      return { borderBg: "border-purple-600/30 bg-purple-600/10", text: "text-purple-500" };
    case "FOUNDATION":
    default:
      return { borderBg: "border-blue-600/30 bg-blue-600/10", text: "text-blue-500" };
  }
};

export default function Home() {
  const isFocused = useIsFocused();

  const { data: modulesList, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });

  const { data: progressData } = useQuery({
    queryKey: ["modules-progress"],
    queryFn: fetchModuleProgress,
  });

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
  });

  const unreadCount = unreadData?.count || 0;

  const mappedModules = (modulesList || []).map((m) => {
    const prog = (progressData || []).find((p) => p.module === m.module_id);
    return {
      id: String(m.module_id),
      category: m.category,
      title: m.name,
      description: m.description,
      progress: prog ? prog.progress_percent : 0,
      status: prog ? prog.status : "not_started",
      order: m.order,
    };
  });

  const nextIncompleteModule = mappedModules
    .filter((m) => m.status !== "completed")
    .sort((a, b) => a.order - b.order)[0];

  const CircularProgress = ({ progress, total, title, subtitle, color = "#D82C15" }: CircularProgressProps) => {
    const size = rs(72);
    const strokeWidth = rs(5);
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / total) * circumference;
    const router = useRouter();


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
              <Flame size={rs(18)} color={color} />
            ) : (
              <View className="flex-row items-baseline">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="text-white font-bold"
                >
                  {progress}
                </Text>
                {title !== "Day Streak" && total !== 100 && (
                  <Text
                    style={{ fontSize: rf(10) }}
                    className="text-gray-400 ml-0.5"
                  >
                    /{total}
                  </Text>
                )}
              </View>
            )}
            {title === "Day Streak" && (
              <Text
                style={{ fontSize: rf(12) }}
                className="text-white font-bold mt-0.5"
              >
                {progress}
              </Text>
            )}
          </View>

        </View>
        <Text className="text-gray-400 text-xs">{subtitle}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
      {isFocused && <StatusBar style="dark" />}

      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center z-10 bg-white">
        <View className="flex-row items-center">
          <Text
            style={{ fontSize: rf(32) }}
            className="font-black italic tracking-tighter text-[#1a1a1a]"
          >
            AT<Text className="text-[#D82C15]">R</Text>
          </Text>
          <View className="ml-1 justify-center mt-1">
            <Text
              style={{ fontSize: rf(6) }}
              className="font-bold text-gray-500 uppercase leading-none"
            >
              Advanced Tactical
            </Text>
            <Text
              style={{ fontSize: rf(6) }}
              className="font-bold text-gray-500 uppercase leading-none"
            >
              Resources
            </Text>
          </View>
        </View>


        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.push("/notifications")} className="relative">
            <Bell size={rs(24)} color="#1a1a1a" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-[#D82C15] rounded-full w-4 h-4 items-center justify-center border border-white">
                <Text style={{ fontSize: rf(8) }} className="text-white font-bold">{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>



          <TouchableOpacity onPress={() => router.push("/profile")} className="w-10 h-10 bg-[#D82C15] rounded-full items-center justify-center">
            <Text className="text-white font-bold tracking-widest text-sm">JH</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>

        <View className="px-6 pb-10">

          {modulesLoading ? (
            <View className="bg-[#1e2a38] rounded-2xl p-5 mb-8 h-[240px] items-center justify-center shadow-sm">
              <ActivityIndicator size="small" color="#D82C15" />
            </View>
          ) : nextIncompleteModule ? (
            <View className="bg-[#1e2a38] rounded-2xl p-5 mb-8 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Continue Learning</Text>
                <View className={`border ${getCategoryStyles(nextIncompleteModule.category).borderBg} px-2 py-1 rounded-full`}>
                  <Text className={`${getCategoryStyles(nextIncompleteModule.category).text} text-[10px] font-bold uppercase`}>
                    {nextIncompleteModule.category}
                  </Text>
                </View>
              </View>

              <Text
                style={{ fontSize: rf(20) }}
                className="text-white font-black mb-1 tracking-tight"
              >
                {nextIncompleteModule.title}
              </Text>
              {/* <Text
                style={{ fontSize: rf(14) }}
                className="text-gray-400 mb-6"
                numberOfLines={2}
              >
                {nextIncompleteModule.description}
              </Text> */}

              <View className="flex-row items-center mb-5 gap-3">
                <View className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <View style={{ width: `${nextIncompleteModule.progress}%` }} className="h-full bg-[#D82C15]" />
                </View>
                <Text className="text-gray-400 text-xs font-bold">{nextIncompleteModule.progress}%</Text>
              </View>

              <TouchableOpacity onPress={() => router.push(`/lesson?moduleId=${nextIncompleteModule.id}`)} className="bg-[#D82C15] w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-red-500/20 active:opacity-80">
                <Text className="text-white font-bold uppercase tracking-wider mr-2">Continue</Text>
                <ChevronRight size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-[#1e2a38] rounded-2xl p-5 mb-8 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Continue Learning</Text>
                <View className="border border-green-600/30 bg-green-600/10 px-2 py-1 rounded-full">
                  <Text className="text-green-500 text-[10px] font-bold uppercase">Completed</Text>
                </View>
              </View>

              <Text
                style={{ fontSize: rf(24) }}
                className="text-white font-black mb-1 tracking-tight"
              >
                All Modules Completed!
              </Text>
              <Text
                style={{ fontSize: rf(14) }}
                className="text-gray-400 mb-6"
              >
                You have successfully finished all the modules.
              </Text>

              <View className="flex-row items-center mb-5 gap-3">
                <View className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <View className="h-full bg-green-500 w-full" />
                </View>
                <Text className="text-gray-400 text-xs font-bold">100%</Text>
              </View>

              <TouchableOpacity onPress={() => router.push("/(tabs)/learn")} className="bg-[#D82C15] w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-red-500/20 active:opacity-80">
                <Text className="text-white font-bold uppercase tracking-wider mr-2">Review Library</Text>
                <ChevronRight size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Access */}
          <View className="mb-8">
            <Text className="text-[#1a1a1a] text-xs font-black tracking-widest uppercase mb-4 opacity-80">Quick Access</Text>

            {/* Grid 2x2 */}
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity onPress={() => router.push("/(tabs)/learn")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View
                  style={{ width: rs(40), height: rs(40) }}
                  className="bg-red-500/10 rounded-xl items-center justify-center mb-4 border border-red-500/20"
                >
                  <BookOpen size={rs(20)} color="#ef4444" />
                </View>
                <Text style={{ fontSize: rf(16) }} className="text-white font-bold">Learn</Text>

              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/(tabs)/guardian")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View
                  style={{ width: rs(40), height: rs(40) }}
                  className="bg-yellow-500/10 rounded-xl items-center justify-center mb-4 border border-yellow-500/20"
                >
                  <Sparkles size={rs(22)} color="#eab308" />
                </View>
                <Text style={{ fontSize: rf(16) }} className="text-white font-bold">AI Assistant</Text>

              </TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => router.push("/(tabs)/tools")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View
                  style={{ width: rs(40), height: rs(40) }}
                  className="bg-teal-500/10 rounded-xl items-center justify-center mb-4 border border-teal-500/20"
                >
                  <CheckSquare size={rs(20)} color="#14b8a6" />
                </View>
                <Text style={{ fontSize: rf(16) }} className="text-white font-bold">Tools</Text>

              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/(tabs)/profile/my-notes")} className="flex-1 bg-[#1e2a38] rounded-2xl p-5 shadow-sm active:opacity-80">
                <View
                  style={{ width: rs(40), height: rs(40) }}
                  className="bg-blue-500/10 rounded-xl items-center justify-center mb-4 border border-blue-500/20"
                >
                  <FileText size={rs(20)} color="#3b82f6" />
                </View>
                <Text style={{ fontSize: rf(16) }} className="text-white font-bold">My Notes</Text>

              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-[#1a1a1a] text-xs font-black tracking-widest uppercase mb-4 opacity-80">Your Progress</Text>
            <View className="bg-[#1e2a38] rounded-2xl p-6 flex-row justify-between items-center shadow-sm">
              <CircularProgress progress={statsLoading ? 0 : (statsData?.modules_completed || 0)} total={statsLoading ? 6 : (statsData?.modules_total || 6)} title={String(statsLoading ? 0 : (statsData?.modules_completed || 0))} subtitle="Modules" color="#eab308" />
              <CircularProgress progress={statsLoading ? 0 : (statsData?.avg_quiz_score || 0)} total={100} title={String(statsLoading ? 0 : (statsData?.avg_quiz_score || 0))} subtitle="Avg. Score" color="#22c55e" />
              <CircularProgress progress={statsLoading ? 0 : (statsData?.day_streak || 0)} total={100} title="Day Streak" subtitle="Day Streak" />
            </View>
          </View>

          {(() => {
            const newestModule = (modulesList || []).length > 0
              ? [...(modulesList || [])].sort((a, b) => b.order - a.order)[0]
              : null;
            if (!newestModule) return null;
            return (
              <TouchableOpacity onPress={() => router.push(`/lesson?moduleId=${newestModule.module_id}`)} className="bg-[#1c2431] rounded-2xl p-5 flex-row items-center border border-gray-800 shadow-sm active:opacity-80">
                <View
                  style={{ width: rs(48), height: rs(48) }}
                  className="bg-yellow-600/20 rounded-xl items-center justify-center mr-4 border border-yellow-600/30"
                >
                  <Trophy size={rs(24)} color="#eab308" />
                </View>
                <View className="flex-1 mr-2">
                  <Text style={{ fontSize: rf(14) }} className="text-white font-bold mb-1 leading-tight">New: {newestModule.name}</Text>
                  <Text style={{ fontSize: rf(12) }} className="text-gray-400">{newestModule.category} • Now available</Text>
                </View>
                <ChevronRight size={rs(20)} color="#9ca3af" />
              </TouchableOpacity>
            );
          })()}


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
