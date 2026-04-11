import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { 
  LucideIcon, 
  BookOpen, 
  Sparkles, 
  Flame, 
  Settings, 
  Trophy, 
  BellOff, 
  X,
  ArrowLeft
} from "lucide-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "lesson" | "ai" | "streak" | "system" | "achievement";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "streak",
    title: "Streak at Risk!",
    body: "You haven't completed a lesson today. Keep your 7-day streak alive.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "lesson",
    title: "New Lesson Available",
    body: "Venue Security — Module 3 is now unlocked and ready to start.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    type: "ai",
    title: "AI Summary Ready",
    body: "Your House Search Procedure summary has been saved to My Notes.",
    time: "3 hrs ago",
    read: false,
  },
  {
    id: "4",
    type: "achievement",
    title: "Assessment Passed",
    body: "You passed the Threat Assessment quiz with 85%. Well done.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "lesson",
    title: "Lesson Reminder",
    body: "Continue where you left off — CP Fundamentals is 44% complete.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    type: "system",
    title: "Subscription Renewal",
    body: "Your Annual Plan renews in 7 days. No action needed.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "7",
    type: "ai",
    title: "AI Chat Insight",
    body: "Based on your recent queries, we recommend reviewing SDR Planning.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "8",
    type: "system",
    title: "App Updated",
    body: "CPTAN v2.4 is live — improved AI responses and offline sync.",
    time: "4 days ago",
    read: true,
  },
];

// ─── Icon config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotifType, { icon: LucideIcon; bg: string; color: string }> = {
  lesson:      { icon: BookOpen, bg: "#0D1E3A", color: "#5B8DEF" },
  ai:          { icon: Sparkles, bg: "#1A1030", color: "#A78BFA" },
  streak:      { icon: Flame, bg: "#2D1A08", color: "#F5A623" },
  system:      { icon: Settings, bg: "#141E2B", color: "#6B7280" },
  achievement: { icon: Trophy, bg: "#0D2318", color: "#4CAF82" },
};

// ─── Notification Row ─────────────────────────────────────────────────────────

const NotifRow = ({
  item,
  onPress,
  onDismiss,
  isLast,
}: {
  item: Notification;
  onPress: () => void;
  onDismiss: () => void;
  isLast: boolean;
}) => {
  const cfg = TYPE_CONFIG[item.type];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-start px-4 py-4 ${
        !isLast ? "border-b border-[#1A2535]" : ""
      } ${!item.read ? "bg-[#0F1D2E]" : "bg-transparent"}`}
    >
      {/* Left unread bar */}
      {!item.read && (
        <View
          style={{ backgroundColor: cfg.color }}
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        />
      )}

      {/* Icon */}
      <View
        style={{ backgroundColor: cfg.bg }}
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shrink-0"
      >
        <cfg.icon size={20} color={cfg.color} />
        {!item.read && (
          <View
            style={{ backgroundColor: cfg.color }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0D1520]"
          />
        )}
      </View>

      {/* Text */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-0.5">
          <Text
            className={`text-sm font-semibold flex-1 pr-2 leading-5 ${
              item.read ? "text-gray-300" : "text-white"
            }`}
          >
            {item.title}
          </Text>
          <Text className="text-gray-600 text-[10px] mt-0.5 shrink-0">{item.time}</Text>
        </View>
        <Text className="text-gray-500 text-xs leading-[18px]">{item.body}</Text>
      </View>

      {/* Dismiss */}
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="ml-2 mt-0.5"
      >
        <X size={14} color="#4B5563" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = ({ title }: { title: string }) => (
  <View className="px-4 py-2.5 bg-[#0D1520]">
    <Text className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">
      {title}
    </Text>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-32">
    <View className="w-20 h-20 rounded-full bg-[#141E2B] items-center justify-center mb-4">
      <BellOff size={32} color="#4B5563" />
    </View>
    <Text className="text-white font-bold text-base mb-1">You're all caught up</Text>
    <Text className="text-gray-500 text-sm text-center px-10 leading-5">
      No new notifications right now. Check back later.
    </Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);

  const unread  = items.filter((n) => !n.read);
  const earlier = items.filter((n) =>  n.read);
  const unreadCount = unread.length;

  const markRead   = (id: string) => setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss    = (id: string) => setItems((p) => p.filter((n) => n.id !== id));
  const markAllRead = ()          => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const clearAll   = ()           => setItems([]);

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      {/* ── Top bar ── */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-[#1A2535]">
        {/* Back */}
        <TouchableOpacity onPress={()=>router.back()} className="w-9 mt-12 h-9 items-start justify-center">
          <ArrowLeft size={24} color="#9ca3af" />
        </TouchableOpacity>

        {/* Title + badge */}
        <View className="flex-row mt-12 items-center  gap-2">
          <Text className="text-white font-bold text-base tracking-wide">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View className="bg-[#E05252] rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Right action */}
        <View className="w-20 items-end">
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text className="text-[#5B8DEF] text-xs mt-10 font-semibold">Mark all read</Text>
            </TouchableOpacity>
          ) : items.length > 0 ? (
            <TouchableOpacity onPress={clearAll}>
              <Text className="text-gray-500 mt-10 text-xs">Clear all</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Body ── */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* NEW */}
          {unread.length > 0 && (
            <>
              <SectionLabel title="New" />
              <View className="bg-[#111B28]">
                {unread.map((item, i) => (
                  <NotifRow
                    key={item.id}
                    item={item}
                    onPress={() => markRead(item.id)}
                    onDismiss={() => dismiss(item.id)}
                    isLast={i === unread.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {/* EARLIER */}
          {earlier.length > 0 && (
            <>
              <SectionLabel title="Earlier" />
              <View className="bg-[#0D1520]">
                {earlier.map((item, i) => (
                  <NotifRow
                    key={item.id}
                    item={item}
                    onPress={() => markRead(item.id)}
                    onDismiss={() => dismiss(item.id)}
                    isLast={i === earlier.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}