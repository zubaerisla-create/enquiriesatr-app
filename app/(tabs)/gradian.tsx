import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: string;
}

// ─── Quick-topic chips ────────────────────────────────────────────────────────

const QUICK_TOPICS = [
  "House search",
  "Vehicle search",
  "SDR route",
  "Threat assessment",
];

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = () => (
  <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E2D45]">
    {/* Left: avatar + title */}
    <View className="flex-row items-center gap-3">
      {/* Avatar */}
      <View className="w-9 h-9 rounded-full bg-[#7C1A1A] items-center justify-center">
        <Text className="text-white text-base">✦</Text>
      </View>
      <View>
        <Text className="text-white font-bold text-base leading-tight">Gradian</Text>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-green-400" />
          <Text className="text-gray-400 text-xs">Online · CPTAN knowledge base</Text>
        </View>
      </View>
    </View>

    {/* Right: history icon */}
    <TouchableOpacity className="w-9 h-9 rounded-full border border-[#2D3748] items-center justify-center">
      <Text className="text-gray-300 text-sm">🕐</Text>
    </TouchableOpacity>
  </View>
);

// ─── AI Message bubble ────────────────────────────────────────────────────────

const AIMessage = ({ message }: { message: Message }) => (
  <View className="mb-1">
    {/* Label + timestamp */}
    <View className="flex-row items-center gap-2 mb-2 px-4">
      <Text className="text-[#4A90D9] text-xs font-bold tracking-widest">CPTAN AI</Text>
      <Text className="text-gray-500 text-xs">{message.timestamp}</Text>
    </View>

    {/* Bubble */}
    <View className="mx-4 bg-[#1B3558] rounded-2xl p-4">
      <Text className="text-white text-sm leading-6">{message.text}</Text>
    </View>

    {/* Copy / Save actions */}
    <View className="flex-row items-center gap-4 px-5 mt-2">
      <TouchableOpacity className="flex-row items-center gap-1">
        <Text className="text-gray-500 text-xs">⧉ Copy</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1">
        <Text className="text-gray-500 text-xs">🔖 Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── User Message bubble ──────────────────────────────────────────────────────

const UserMessage = ({ message }: { message: Message }) => (
  <View className="items-end px-4 mb-3">
    <View className="bg-[#2A4A6B] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
      <Text className="text-white text-sm leading-6">{message.text}</Text>
    </View>
  </View>
);

// ─── Quick Topic Chips ────────────────────────────────────────────────────────

const QuickTopics = ({
  onSelect,
}: {
  onSelect: (topic: string) => void;
}) => (
  <View className="flex-row flex-wrap gap-2 px-4 mt-4">
    {QUICK_TOPICS.map((topic) => (
      <TouchableOpacity
        key={topic}
        onPress={() => onSelect(topic)}
        className="border border-[#2D3D52] rounded-full px-4 py-2"
      >
        <Text className="text-gray-300 text-sm">{topic}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Input Bar ────────────────────────────────────────────────────────────────

const InputBar = ({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
}) => (
  <View className="flex-row items-center px-4 py-3 border-t border-[#1E2D45] bg-[#111827] gap-3">
    {/* Attachment */}
    <TouchableOpacity>
      <Text className="text-gray-500 text-xl">📎</Text>
    </TouchableOpacity>

    {/* Text field */}
    <TextInput
      className="flex-1 text-gray-300 text-sm py-2"
      placeholder="Ask anything about close protection..."
      placeholderTextColor="#4B5563"
      value={value}
      onChangeText={onChange}
      multiline
    />

    {/* Mic */}
    <TouchableOpacity>
      <Text className="text-gray-400 text-xl">🎤</Text>
    </TouchableOpacity>

    {/* Send */}
    <TouchableOpacity
      onPress={onSend}
      className="w-9 h-9 rounded-full bg-[#2563EB] items-center justify-center"
    >
      <Text className="text-white text-sm">➤</Text>
    </TouchableOpacity>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    text: "Hello. I'm the CPTAN AI — trained on close protection doctrine, procedures, and operational best practices.  Ask me anything about CP, or choose a quick topic below.",
    timestamp: "09:08",
  },
];

export default function Gradian() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", text: trimmed, timestamp },
    ]);
    setInput("");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F1824]">
      <StatusBar style="light" />

      {/* Header */}
      <Header />

      {/* Messages + quick topics */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) =>
            msg.role === "ai" ? (
              <AIMessage key={msg.id} message={msg} />
            ) : (
              <UserMessage key={msg.id} message={msg} />
            )
          )}

          {/* Show quick topics only after the first AI message with no replies yet */}
          {messages.length === 1 && (
            <QuickTopics onSelect={(t) => sendMessage(t)} />
          )}
        </ScrollView>

        {/* Input bar */}
        <InputBar
          value={input}
          onChange={setInput}
          onSend={() => sendMessage(input)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}