import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Lock,
  Target
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedPage } from "../../../components/ui";
import { fetchAssessmentHistory, UserAssessmentAttempt } from "../../../lib/assessments";
import { fetchModules, Module } from "../../../lib/modules";

type TagKey = "FOUNDATION" | "TACTICAL" | "OPERATIONS" | "LEGAL";

const TAG_STYLE: Record<TagKey, { bg: string; text: string }> = {
  FOUNDATION: { bg: "#0D2318", text: "#4CAF82" },
  TACTICAL: { bg: "#2D1010", text: "#E05252" },
  OPERATIONS: { bg: "#2D1C0A", text: "#F5A623" },
  LEGAL: { bg: "#101828", text: "#5B8DEF" },
};

const CATEGORY_COLORS: Record<string, string> = {
  FOUNDATION: "#4CAF82",
  TACTICAL: "#E05252",
  OPERATIONS: "#F5A623",
  LEGAL: "#5B8DEF",
};

const StatCard = ({
  value,
  label,
  valueColor,
  bordered,
}: {
  value: string;
  label: string;
  valueColor: string;
  bordered?: boolean;
}) => (
  <View
    className={`flex-1 bg-[#141E2B] rounded-2xl py-4 items-center justify-center ${bordered ? "border border-[#2A3D52]" : ""
      }`}
  >
    <Text style={{ color: valueColor }} className="text-3xl font-extrabold">
      {value}
    </Text>
    <Text className="text-gray-500 text-[10px] font-bold tracking-widest mt-1 uppercase">
      {label}
    </Text>
  </View>
);

const RingIcon = ({ color, locked }: { color: string; locked: boolean }) => (
  <View className="w-10 h-10 items-center justify-center">
    {locked ? (
      <Lock size={20} color="#4B5563" />
    ) : (
      <Target size={24} color={color} />
    )}
  </View>
);

const AssessmentCard = ({
  item,
  latestAttempt,
  onStart,
  onReview,
}: {
  item: Module;
  latestAttempt?: UserAssessmentAttempt;
  onStart: () => void;
  onReview: () => void;
}) => {
  const color = CATEGORY_COLORS[item.category] || "#4CAF82";
  const tagStyle = TAG_STYLE[item.category] || TAG_STYLE.FOUNDATION;

  return (
    <View className="mx-4 mb-3 bg-[#141E2B] rounded-2xl px-4 py-4 flex-row items-center gap-3">
      <RingIcon color={color} locked={false} />
      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-white font-semibold text-sm">{item.name}</Text>
          <View style={{ backgroundColor: tagStyle.bg }} className="px-1.5 py-0.5 rounded">
            <Text style={{ color: tagStyle.text }} className="text-[9px] font-bold tracking-widest">
              {item.category}
            </Text>
          </View>
        </View>
        {latestAttempt ? (
          <Text className={latestAttempt.passed ? "text-[#10B981] text-xs mt-0.5 font-medium" : "text-[#EF4444] text-xs mt-0.5 font-medium"}>
            {latestAttempt.passed ? "PASSED" : "FAILED"} · Score: {latestAttempt.percent}%
          </Text>
        ) : (
          <Text className="text-gray-500 text-xs mt-0.5">
            5 questions · 70% to pass
          </Text>
        )}
      </View>
      <View className="flex-row gap-2">
        {latestAttempt && (
          <TouchableOpacity
            onPress={onReview}
            className="bg-[#1E293B] rounded-xl px-3 py-2 border border-[#2D3748]"
          >
            <Text className="text-white text-xs font-semibold">
              Review
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onStart}
          style={{ borderColor: color }}
          className="border rounded-xl px-3 py-2"
        >
          <Text style={{ color }} className="text-xs font-semibold">
            {latestAttempt ? "Retake" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Assessments() {
  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["assessment-history"],
    queryFn: fetchAssessmentHistory,
  });

  if (isLoadingModules || isLoadingHistory) {
    return (
      <View className="flex-1 bg-[#0D1520] justify-center items-center">
        <ActivityIndicator size="large" color="#D82C15" />
      </View>
    );
  }

  const attemptedModuleIds = new Set(history.map(h => h.module_id));
  const passedModuleIds = new Set(history.filter(h => h.passed).map(h => h.module_id));

  const total = modules.length;
  const attempted = attemptedModuleIds.size;
  const passed = passedModuleIds.size;

  const getModuleAttempt = (moduleId: number) => {
    return history.find(h => h.module_id === moduleId);
  };

  return (
    <View className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />
      <AnimatedPage>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-4 mb-5">
            <Text className="text-gray-500 text-sm mt-1">
              Test your knowledge after each module
            </Text>
          </View>

          <View className="flex-row mx-4 gap-3 mb-5">
            <StatCard value={String(total)} label="Total" valueColor="#E05252" />
            <StatCard value={String(attempted)} label="Attempted" valueColor="#4CAF82" bordered />
            <StatCard value={String(passed)} label="Passed" valueColor="#4CAF82" bordered />
          </View>

          {modules.map((item) => (
            <AssessmentCard
              key={item.module_id}
              item={item}
              latestAttempt={getModuleAttempt(item.module_id)}
              onStart={() => router.navigate(`/assessment/quiz?moduleId=${item.module_id}`)}
              onReview={() => {
                const attempt = getModuleAttempt(item.module_id);
                if (attempt) {
                  router.navigate(`/assessment/results?attemptId=${attempt.id}`);
                }
              }}
            />
          ))}
        </ScrollView>
      </AnimatedPage>
    </View>
  );
}