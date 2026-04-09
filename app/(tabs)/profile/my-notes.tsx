import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "ALL" | "LESSONS" | "AI" | "PERSONAL";
type NoteType = "LESSON" | "AI ASSISTANT" | "PERSONAL";

interface Note {
  id: string;
  type: NoteType;
  title: string;
  body: string;
  source: string;
  date: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NOTES: Note[] = [
  {
    id: "1",
    type: "LESSON",
    title: "Threat Matrix Notes",
    body: "Intent + Capability + Opportunity = Threat exists. Always evaluate all three axes before escalating",
    source: "Lesson: Threat & Risk Assessment",
    date: "22 Mar 2026",
  },
  {
    id: "2",
    type: "AI ASSISTANT",
    title: "House Search Procedure",
    body: "Key points saved from AI: 1. Establish perimeter first 2. Two-person search method 3. Clear entry point",
    source: "AI Assistant",
    date: "26 Mar 2026",
  },
  {
    id: "3",
    type: "LESSON",
    title: "SDR Planning Reminders",
    body: "SDR must have multiple decision points. Vary the route each time. Use natural cover changes (shops,",
    source: "Lesson: Surveillance Detection Routes",
    date: "18 Mar 2026",
  },
];

const FILTER_TABS: FilterTab[] = ["ALL", "LESSONS", "AI", "PERSONAL"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeStyle = (type: NoteType) => {
  switch (type) {
    case "LESSON":
      return { icon: "□", iconColor: "#5B8DEF", labelColor: "#5B8DEF" };
    case "AI ASSISTANT":
      return { icon: "✦", iconColor: "#F5A623", labelColor: "#F5A623" };
    case "PERSONAL":
      return { icon: "◎", iconColor: "#4CAF82", labelColor: "#4CAF82" };
  }
};

const filterMatch = (note: Note, tab: FilterTab) => {
  if (tab === "ALL") return true;
  if (tab === "LESSONS") return note.type === "LESSON";
  if (tab === "AI") return note.type === "AI ASSISTANT";
  if (tab === "PERSONAL") return note.type === "PERSONAL";
  return true;
};

// ─── Note Card ────────────────────────────────────────────────────────────────

const NoteCard = ({ note }: { note: Note }) => {
  const style = typeStyle(note.type);

  return (
    <View className="mx-4 mb-3 bg-[#141E2B] rounded-2xl p-4">
      {/* Type label row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5">
          <Text style={{ color: style.iconColor }} className="text-sm">
            {style.icon}
          </Text>
          <Text
            style={{ color: style.labelColor }}
            className="text-[10px] font-bold tracking-widest"
          >
            {note.type}
          </Text>
        </View>
        <TouchableOpacity className="p-1">
          <Text className="text-gray-500 text-base">🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-white font-bold text-base mb-1">{note.title}</Text>

      {/* Body */}
      <Text className="text-gray-400 text-xs leading-5 mb-3">{note.body}</Text>

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-600 text-xs">{note.source}</Text>
        <Text className="text-gray-600 text-xs">{note.date}</Text>
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyNotes() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const filtered = NOTES.filter((n) => filterMatch(n, activeTab));

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      {/* Back nav */}
      <TouchableOpacity className="flex-row items-center gap-1 px-4 pt-4 pb-2">
        <Text className="text-gray-400 text-base">←</Text>
        <Text className="text-gray-400 text-sm">Profile</Text>
      </TouchableOpacity>

      {/* Header */}
      <View className="flex-row items-end justify-between px-4 mb-4">
        <Text className="text-white text-2xl font-extrabold tracking-wider uppercase">
          My Notes
        </Text>
        <Text className="text-gray-500 text-sm">{NOTES.length} notes</Text>
      </View>

      {/* Filter tabs */}
      <View className="flex-row gap-2 px-4 mb-5">
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full ${
                isActive
                  ? "bg-[#E05252]"
                  : "bg-transparent border border-[#2D3748]"
              }`}
            >
              <Text
                className={`text-xs font-bold tracking-widest ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-[#E05252] items-center justify-center shadow-lg"
        style={{
          shadowColor: "#E05252",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white text-2xl font-light leading-none">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}