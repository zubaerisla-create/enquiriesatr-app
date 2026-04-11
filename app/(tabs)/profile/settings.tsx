import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationSetting {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "push",
    icon: "🔔",
    iconBg: "#2D1010",
    iconColor: "#E05252",
    title: "Push Notifications",
    description: "Receive app notifications on your device",
  },
  {
    id: "lessons",
    icon: "📖",
    iconBg: "#0D1828",
    iconColor: "#5B8DEF",
    title: "Lesson Reminders",
    description: "Daily reminders to continue your training",
  },
  {
    id: "streak",
    icon: "🔔",
    iconBg: "#2D2510",
    iconColor: "#D4A843",
    title: "Streak Alerts",
    description: "Notify me if I'm at risk of losing my streak",
  },
];

// ─── Custom Toggle ────────────────────────────────────────────────────────────
// Uses React Native's Switch styled to match the red toggle in the screenshot

const RedToggle = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    trackColor={{ false: "#2D3748", true: "#C0392B" }}
    thumbColor={value ? "#FFFFFF" : "#6B7280"}
    ios_backgroundColor="#2D3748"
    style={Platform.OS === "android" ? { transform: [{ scale: 1.1 }] } : {}}
  />
);

// ─── Notification Row ─────────────────────────────────────────────────────────

const NotificationRow = ({
  item,
  value,
  onToggle,
  isLast,
}: {
  item: NotificationSetting;
  value: boolean;
  onToggle: (v: boolean) => void;
  isLast: boolean;
}) => (
  <View
    className={`flex-row items-center px-4 py-4 ${
      !isLast ? "border-b border-[#1E2D3D]" : ""
    }`}
  >
    {/* Icon */}
    <View
      style={{ backgroundColor: item.iconBg }}
      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
    >
      <Text style={{ color: item.iconColor }} className="text-lg">
        {item.icon}
      </Text>
    </View>

    {/* Text */}
    <View className="flex-1 mr-3">
      <Text className="text-white font-semibold text-sm mb-0.5">{item.title}</Text>
      <Text className="text-gray-500 text-xs leading-4">{item.description}</Text>
    </View>

    {/* Toggle */}
    <RedToggle value={value} onValueChange={onToggle} />
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Settings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    lessons: true,
    streak: true,
  });

  const handleToggle = (id: string, val: boolean) => {
    setToggles((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
   


        {/* Notifications section */}
        <View className="mx-4 mb-4 bg-[#141E2B] rounded-2xl overflow-hidden">
          {/* Section label */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
              Notifications
            </Text>
          </View>

          {/* Rows */}
          {NOTIFICATION_SETTINGS.map((item, index) => (
            <NotificationRow
              key={item.id}
              item={item}
              value={toggles[item.id]}
              onToggle={(v) => handleToggle(item.id, v)}
              isLast={index === NOTIFICATION_SETTINGS.length - 1}
            />
          ))}
        </View>

        {/* Danger Zone section */}
        <View className="mx-4 bg-[#1A0E0E] border border-[#3D1A1A] rounded-2xl overflow-hidden">
          {/* Section label */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-[#E05252] text-[10px] font-bold tracking-widest uppercase">
              Danger Zone
            </Text>
          </View>

          {/* Delete Account row */}
          <TouchableOpacity className="flex-row items-center px-4 py-4">
            {/* Icon */}
            <View className="w-10 h-10 rounded-xl bg-[#2D1010] items-center justify-center mr-3">
              <Text className="text-[#E05252] text-lg">⚠️</Text>
            </View>

            {/* Text */}
            <View className="flex-1">
              <Text className="text-[#E05252] font-semibold text-sm mb-0.5">
                Delete Account
              </Text>
              <Text className="text-gray-500 text-xs leading-4">
                Permanently delete your account and all data
              </Text>
            </View>

            {/* Chevron */}
            <Text className="text-gray-500 text-lg">›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}