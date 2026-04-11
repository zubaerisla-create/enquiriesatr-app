  import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

type TagKey = "FOUNDATION" | "TACTICAL" | "OPERATIONS" | "LEGAL" | "SPECIALIST";

interface Assessment {
  id: string;
  title: string;
  tag: TagKey;
  questions: number;
  passPercent: number;
  locked: boolean;
  /** ring color */
  ringColor: string;
}

// ─── Tag styles ───────────────────────────────────────────────────────────────

const TAG_STYLE: Record<TagKey, { bg: string; text: string }> = {
  FOUNDATION: { bg: "#0D2318",  text: "#4CAF82" },
  TACTICAL:   { bg: "#2D1010",  text: "#E05252" },
  OPERATIONS: { bg: "#2D1C0A",  text: "#F5A623" },
  LEGAL:      { bg: "#101828",  text: "#5B8DEF" },
  SPECIALIST: { bg: "#1A1028",  text: "#A78BFA" },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ASSESSMENTS: Assessment[] = [
  {
    id: "1",
    title: "CP Fundamental",
    tag: "FOUNDATION",
    questions: 5,
    passPercent: 70,
    locked: false,
    ringColor: "#4CAF82",
  },
  {
    id: "2",
    title: "Threat Assessmen",
    tag: "TACTICAL",
    questions: 5,
    passPercent: 70,
    locked: false,
    ringColor: "#E05252",
  },
  {
    id: "3",
    title: "Venue Security",
    tag: "OPERATIONS",
    questions: 5,
    passPercent: 70,
    locked: false,
    ringColor: "#F5A623",
  },
  {
    id: "4",
    title: "Advance Work",
    tag: "OPERATIONS",
    questions: 5,
    passPercent: 70,
    locked: false,
    ringColor: "#F5A623",
  },
  {
    id: "5",
    title: "Legal Framework",
    tag: "LEGAL",
    questions: 5,
    passPercent: 70,
    locked: true,
    ringColor: "#5B8DEF",
  },
  {
    id: "6",
    title: "Specialist Operations",
    tag: "SPECIALIST",
    questions: 5,
    passPercent: 70,
    locked: true,
    ringColor: "#A78BFA",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    className={`flex-1 bg-[#141E2B] rounded-2xl py-4 items-center justify-center ${
      bordered ? "border border-[#2A3D52]" : ""
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

/** Circular target/ring icon */
const RingIcon = ({ color, locked }: { color: string; locked: boolean }) => (
  <View className="w-10 h-10 items-center justify-center">
    {locked ? (
      <Text className="text-gray-500 text-2xl">🔒</Text>
    ) : (
      <View
        style={{ borderColor: color }}
        className="w-9 h-9 rounded-full border-2 items-center justify-center"
      >
        <View
          style={{ borderColor: color }}
          className="w-5 h-5 rounded-full border-2 items-center justify-center"
        >
          <View
            style={{ backgroundColor: color }}
            className="w-2 h-2 rounded-full"
          />
        </View>
      </View>
    )}
  </View>
);

const AssessmentCard = ({ item }: { item: Assessment }) => {
  const tag = TAG_STYLE[item.tag];

  if (item.locked) {
    return (
      <View className="mx-4 mb-3 bg-[#1A2130] rounded-2xl px-4 py-4 flex-row items-center gap-3 opacity-60">
        <RingIcon color={item.ringColor} locked />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-gray-400 font-semibold text-sm">{item.title}</Text>
            <View style={{ backgroundColor: tag.bg }} className="px-1.5 py-0.5 rounded">
              <Text style={{ color: tag.text }} className="text-[9px] font-bold tracking-widest">
                {item.tag}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-xs mt-0.5">Upgrade to unlock</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-3 bg-[#141E2B] rounded-2xl px-4 py-4 flex-row items-center gap-3">
      <RingIcon color={item.ringColor} locked={false} />
      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-white font-semibold text-sm">{item.title}</Text>
          <View style={{ backgroundColor: tag.bg }} className="px-1.5 py-0.5 rounded">
            <Text style={{ color: tag.text }} className="text-[9px] font-bold tracking-widest">
              {item.tag}
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 text-xs mt-0.5">
          {item.questions} questions · {item.passPercent}% to pass
        </Text>
      </View>
      <TouchableOpacity
        style={{ borderColor: item.ringColor }}
        className="border rounded-xl px-4 py-2"
      >
        <Text style={{ color: item.ringColor }} className="text-xs font-semibold">
          Start
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Assessments() {
  const total = ASSESSMENTS.length;
  const attempted = 0;
  const passed = 0;

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >


        {/* Page header */}
        <View className="px-4 mb-5">
        
          <Text className="text-gray-500 text-sm mt-1">
            Test your knowledge after each module
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row mx-4 gap-3 mb-5">
          <StatCard value={String(total)}    label="Total"    valueColor="#E05252" />
          <StatCard value={String(attempted)} label="Attempted" valueColor="#4CAF82" bordered />
          <StatCard value={String(passed)}   label="Passed"   valueColor="#4CAF82" bordered />
        </View>

        {/* Assessment cards */}
        {ASSESSMENTS.map((item) => (
          <AssessmentCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}