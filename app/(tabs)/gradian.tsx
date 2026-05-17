import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { 
  Sparkles, 
  History, 
  Copy, 
  Bookmark, 
  Paperclip, 
  Mic, 
  SendHorizontal 
} from "lucide-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: string;
}

// ─── Quick Topics ─────────────────────────────────────────────────────────────

const QUICK_TOPICS = [
  "House search",
  "Vehicle search",
  "SDR route",
  "Threat assessment",
];

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = () => (
  <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E2D45]">
    <View className="flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-full bg-[#7C1A1A] items-center justify-center">
        <Sparkles size={18} color="white" />
      </View>
      <View>
        <Text className="text-white font-bold text-base leading-tight">Gradian</Text>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-green-400" />
          <Text className="text-gray-400 text-xs">Online · CPTAN knowledge base</Text>
        </View>
      </View>
    </View>

    <TouchableOpacity className="w-9 h-9 rounded-full border border-[#2D3748] items-center justify-center">
      <History size={16} color="#9CA3AF" />
    </TouchableOpacity>
  </View>
);

// ─── AI Message ───────────────────────────────────────────────────────────────

const AIMessage = ({ message }: { message: Message }) => (
  <View className="mb-6">
    <View className="flex-row items-center gap-2 mb-2 px-4">
      <Text className="text-[#4A90D9] mt-4 text-xs font-bold tracking-widest">CPTAN AI</Text>
      <Text className="text-gray-500 mt-4 text-xs">{message.timestamp}</Text>
    </View>

    <View className="mx-4 bg-[#1B3558] rounded-2xl p-4">
      <Text className="text-white text-sm leading-6">{message.text}</Text>
    </View>

    <View className="flex-row items-center gap-4 px-5 mt-2">
      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Copy size={12} color="#6B7280" />
        <Text className="text-gray-500 text-xs">Copy</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Bookmark size={12} color="#6B7280" />
        <Text className="text-gray-500 text-xs">Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── User Message ─────────────────────────────────────────────────────────────

const UserMessage = ({ message }: { message: Message }) => (
  <View className="items-end px-4 mb-4">
    <View className="bg-[#2A4A6B] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
      <Text className="text-white text-sm leading-6">{message.text}</Text>
    </View>
  </View>
);

// ─── Quick Topics ─────────────────────────────────────────────────────────────

const QuickTopics = ({ onSelect }: { onSelect: (topic: string) => void }) => (
  <View className="flex-row flex-wrap gap-2 px-4 mt-6 mb-8">
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
  <View className="px-4 py-4 border-t border-[#1E2D45] bg-[#111827]">
    <View className="flex-row items-center gap-3">
      <TouchableOpacity>
        <Paperclip size={20} color="#6B7280" />
      </TouchableOpacity>

      <TextInput
        className="flex-1 bg-[#1F2A3C] text-gray-300 text-sm px-4 py-3 rounded-2xl"
        placeholder="Ask anything about close protection..."
        placeholderTextColor="#4B5563"
        value={value}
        onChangeText={onChange}
        multiline
        maxLength={500}
        blurOnSubmit={false}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />

      <TouchableOpacity>
        <Mic size={20} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim()}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          value.trim() ? "bg-[#2563EB]" : "bg-[#334155]"
        }`}
      >
        <SendHorizontal size={18} color="white" />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    text: "Hello. I'm the CPTAN AI — trained on close protection doctrine, procedures, and operational best practices. Ask me anything about CP, or choose a quick topic below.",
    timestamp: "09:08",
  },
];

export default function Gradian() {
  const isFocused = useIsFocused();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);

  const sendMessage = (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText) return;

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      text: messageText,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0F1824]">
      {isFocused && <StatusBar style="light" />}

      <Header />

      {/* Keyboard Avoiding View - This is the key fix */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) =>
              msg.role === "ai" ? (
                <AIMessage key={msg.id} message={msg} />
              ) : (
                <UserMessage key={msg.id} message={msg} />
              )
            )}

            {messages.length === 1 && <QuickTopics onSelect={sendMessage} />}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Input Bar - This will move up when keyboard opens */}
        <InputBar
          value={input}
          onChange={setInput}
          onSend={() => sendMessage()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}