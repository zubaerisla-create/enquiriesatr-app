import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "ALL" | "FOUNDATION" | "TACTICAL" | "OPERATIONS" | "LEGAL";

interface Module {
  id: string;
  category: Category;
  categoryColor: string;
  title: string;
  description: string;
  lessons: number;
  hours: number;
  minutes: number;
  progress: number; // 0–100, or -1 for locked
  status: "in_progress" | "completed" | "not_started" | "locked";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  {
    id: "1",
    category: "FOUNDATION",
    categoryColor: "#3B82F6",
    title: "CP Fundamentals",
    description:
      "Core principles, roles, and responsibilities of close protection professionals operating in the modern security landscape.",
    lessons: 5,
    hours: 2,
    minutes: 30,
    progress: 44,
    status: "in_progress",
  },
  {
    id: "2",
    category: "TACTICAL",
    categoryColor: "#F97316",
    title: "Threat Assessment",
    description:
      "Systematic evaluation of threats, vulnerabilities and risk matrices to protect the principal at all times.",
    lessons: 4,
    hours: 1,
    minutes: 55,
    progress: 100,
    status: "completed",
  },
  {
    id: "3",
    category: "OPERATIONS",
    categoryColor: "#22C55E",
    title: "Venue Security",
    description:
      "Planning, advancing, and securing venues — from private residences to public events and international locations.",
    lessons: 5,
    hours: 2,
    minutes: 45,
    progress: 38,
    status: "in_progress",
  },
  {
    id: "4",
    category: "OPERATIONS",
    categoryColor: "#22C55E",
    title: "Advance Work",
    description:
      "Comprehensive advance planning methodologies for CP operatives, residential stays, and high-risk operations.",
    lessons: 4,
    hours: 2,
    minutes: 10,
    progress: 8,
    status: "not_started",
  },
  {
    id: "5",
    category: "LEGAL",
    categoryColor: "#A855F7",
    title: "Legal Framework",
    description:
      "UK and international legal considerations for CP operatives, including use of force, licensing, and liability.",
    lessons: 4,
    hours: 1,
    minutes: 30,
    progress: -1,
    status: "locked",
  },
  {
    id: "6",
    category: "OPERATIONS",
    categoryColor: "#22C55E",
    title: "Specialist Operations",
    description:
      "Advanced techniques for hostile environment operations, maritime security, and VIP escort procedures.",
    lessons: 5,
    hours: 2,
    minutes: 10,
    progress: -1,
    status: "locked",
  },
];

const TABS: { label: string; value: Category }[] = [
  { label: "ALL", value: "ALL" },
  { label: "FOUNDATION", value: "FOUNDATION" },
  { label: "TACTICAL", value: "TACTICAL" },
  { label: "OPERATIONS", value: "OPERATIONS" },
  { label: "LEGAL", value: "LEGAL" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SearchBar = () => (
  <View className="flex-row items-center bg-[#1E2535] rounded-xl px-4 py-3 mx-4 mb-4">
    {/* Search icon */}
    <Text className="text-gray-400 text-base mr-2">🔍</Text>
    <TextInput
      className="flex-1 text-gray-300 text-sm"
      placeholder="Search modules..."
      placeholderTextColor="#6B7280"
    />
  </View>
);

const FilterTabs = ({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="px-4 mb-4"
    contentContainerStyle={{ gap: 8 }}
  >
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.value}
        onPress={() => onChange(tab.value)}
        className={`px-4 py-2 rounded-full border ${
          active === tab.value
            ? "bg-white border-white"
            : "bg-transparent border-[#2D3748]"
        }`}
      >
        <Text
          className={`text-xs font-semibold tracking-widest ${
            active === tab.value ? "text-[#0F1624]" : "text-gray-400"
          }`}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const ProgressBar = ({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) => (
  <View className="h-1 bg-[#2D3748] rounded-full overflow-hidden">
    <View
      style={{ width: `${progress}%`, backgroundColor: color }}
      className="h-full rounded-full"
    />
  </View>
);

const StatusBadge = ({ status }: { status: Module["status"] }) => {
  if (status === "completed")
    return (
      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-green-400 mr-1" />
        <Text className="text-green-400 text-xs">Completed</Text>
      </View>
    );
  if (status === "in_progress")
    return (
      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-blue-400 mr-1" />
        <Text className="text-blue-400 text-xs">In progress</Text>
      </View>
    );
  if (status === "not_started")
    return (
      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-gray-500 mr-1" />
        <Text className="text-gray-400 text-xs">Not started</Text>
      </View>
    );
  return null;
};

const LockIcon = () => (
  <Text className="text-gray-500 text-lg">🔒</Text>
);

const ModuleCard = ({ module }: { module: Module }) => {
  const isLocked = module.status === "locked";

  return (
    <View
      className={`mx-4 mb-3 rounded-2xl p-4 border ${
        isLocked ? "border-[#2D3748] bg-[#141B2A]" : "border-[#1E2D45] bg-[#131C2E]"
      }`}
    >
      {/* Header row */}
      <View className="flex-row items-start justify-between mb-2">
        {/* Category pill */}
        <View
          style={{ backgroundColor: module.categoryColor + "22" }}
          className="px-2 py-0.5 rounded"
        >
          <Text
            style={{ color: module.categoryColor }}
            className="text-[10px] font-bold tracking-widest"
          >
            {module.category}
          </Text>
        </View>
        {isLocked && <LockIcon />}
        {module.status === "completed" && (
          <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        className={`text-base font-bold mb-1 ${
          isLocked ? "text-gray-500" : "text-white"
        }`}
      >
        {module.title}
      </Text>

      {/* Description */}
      <Text
        className={`text-xs leading-5 mb-3 ${
          isLocked ? "text-gray-600" : "text-gray-400"
        }`}
      >
        {module.description}
      </Text>

      {/* Meta row */}
      <View className="flex-row items-center mb-3 gap-3">
        <Text className={`text-xs ${isLocked ? "text-gray-600" : "text-gray-400"}`}>
          📋 {module.lessons} lessons
        </Text>
        <Text className="text-gray-600">·</Text>
        <Text className={`text-xs ${isLocked ? "text-gray-600" : "text-gray-400"}`}>
          🕐 {module.hours}h {module.minutes}m
        </Text>
      </View>

      {/* Progress / Upgrade */}
      {isLocked ? (
        <TouchableOpacity className="bg-[#1E2535] border border-[#2D3748] rounded-xl py-2.5 items-center">
          <Text className="text-gray-300 text-xs font-semibold">
            🔒 Upgrade to unlock
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          <ProgressBar
            progress={module.progress}
            color={
              module.status === "completed"
                ? "#22C55E"
                : module.categoryColor
            }
          />
          <View className="flex-row items-center justify-between mt-2">
            <StatusBadge status={module.status} />
            <Text className="text-gray-500 text-xs">{module.progress}%</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ModulesLibrary() {
  const [activeTab, setActiveTab] = useState<Category>("ALL");

  const filtered =
    activeTab === "ALL"
      ? MODULES
      : MODULES.filter((m) => m.category === activeTab);

  return (
    <View className="flex-1 bg-[#0B1120] pt-14">
      {/* Title */}
      <Text className="text-white text-2xl font-extrabold tracking-wider px-4 mb-4">
        MODULES LIBRARY
      </Text>

      {/* Search */}
      <SearchBar />

      {/* Filter tabs */}
      <FilterTabs active={activeTab} onChange={setActiveTab} />

      {/* Cards */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ModuleCard module={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}