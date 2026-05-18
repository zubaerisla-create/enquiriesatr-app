import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useNotesStore, deleteNote, Note, NoteType, loadNotes } from "./notesStore";

type FilterTab = "ALL" | "LESSONS" | "AI" | "PERSONAL";

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
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/profile/note-editor', params: { id: note.id } })}
      className="mx-4 mb-3 bg-[#141E2B] rounded-2xl p-4"
    >
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
        <TouchableOpacity className="p-1" onPress={() => deleteNote(note.id)}>
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
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyNotes() {
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const notes = useNotesStore();

  React.useEffect(() => {
    if (isFocused) {
      loadNotes();
    }
  }, [isFocused]);

  const filtered = notes.filter((n) => filterMatch(n, activeTab));

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />




      {/* Filter tabs */}
      <View className="flex-row gap-2 px-4 mb-4 mt-4">
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full ${isActive
                ? "bg-[#E05252]"
                : "bg-transparent border border-[#2D3748]"
                }`}
            >
              <Text
                className={`text-xs font-bold tracking-widest ${isActive ? "text-white" : "text-gray-400"
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
        {filtered.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Text className="text-gray-500 text-sm text-center">No notes available</Text>
          </View>
        ) : (
          filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/profile/note-editor')}
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