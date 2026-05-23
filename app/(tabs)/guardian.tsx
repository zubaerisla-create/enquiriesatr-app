import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import {
  Sparkles,
  History,
  Copy,
  Bookmark,
  SendHorizontal,
  Square,
  X,
  Plus,
} from "lucide-react-native";

import { llmChat, llmChatStream, getConversations, getConversationMessages, type Conversation } from "../../lib/llm";
import Markdown from "react-native-markdown-display";
import { createNote } from "../../lib/notes";
import { AppBottomSheet } from "../../components/ui";
import { useBottomSheet } from "../../hooks/useBottomSheet";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: string;
}

// ─── Quick Topics ─────────────────────────────────────────────────────────────

const QUICK_TOPICS = [
  "The Threat Triad",
  "Sterile Search Procedures",
  "Vehicle SCRIM Method",
  "Actions on Attack",
  "Legal Use of Force"
];

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = ({
  onHistoryPress,
  onNewChatPress,
}: {
  onHistoryPress: () => void;
  onNewChatPress: () => void;
}) => (
  <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E2D45]">
    <View className="flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-full bg-[#7C1A1A] items-center justify-center">
        <Sparkles size={18} color="white" />
      </View>
      <View>
        <Text className="text-white font-bold text-base leading-tight">Guardian</Text>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-green-400" />
          <Text className="text-gray-400 text-xs">Online</Text>
        </View>
      </View>
    </View>

    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={onNewChatPress}
        className="w-9 h-9 rounded-full border border-[#2D3748] items-center justify-center"
      >
        <Plus size={16} color="#9CA3AF" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onHistoryPress}
        className="w-9 h-9 rounded-full border border-[#2D3748] items-center justify-center"
      >
        <History size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── AI Message ───────────────────────────────────────────────────────────────

const markdownStyles = {
  body: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 24,
  },
  heading1: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold" as const,
    marginTop: 12,
    marginBottom: 6,
  },
  heading2: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold" as const,
    marginTop: 10,
    marginBottom: 4,
  },
  heading3: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  list_item: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  strong: {
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
};

const AIMessage = ({
  message,
  onCopy,
  onSave,
  copied,
  saved,
  saving,
  isStreaming,
}: {
  message: Message;
  onCopy: () => void;
  onSave: () => void;
  copied: boolean;
  saved: boolean;
  saving: boolean;
  isStreaming?: boolean;
}) => (
  <View className="mb-6">
    <View className="flex-row items-center gap-2 mb-2 px-4">
      <Text className="text-[#4A90D9] mt-4 text-xs font-bold tracking-widest">CPTAN AI</Text>
      <Text className="text-gray-500 mt-4 text-xs">{message.timestamp}</Text>
    </View>

    <View className="mx-4 bg-[#1B3558] rounded-2xl p-4">
      <Markdown style={markdownStyles}>{message.text}</Markdown>
    </View>

    {message.id !== "1" && !isStreaming && (
      <View className="flex-row items-center gap-4 px-5 mt-2">
        <TouchableOpacity onPress={onCopy} className="flex-row items-center gap-1.5">
          <Copy size={12} color={copied ? "#60A5FA" : "#6B7280"} />
          <Text className={copied ? "text-blue-400 text-xs" : "text-gray-500 text-xs"}>
            {copied ? "Copied" : "Copy"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          className="flex-row items-center gap-1.5"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#93C5FD" />
          ) : (
            <Bookmark size={12} color={saved ? "#93C5FD" : "#6B7280"} />
          )}
          <Text className={saved ? "text-blue-300 text-xs" : "text-gray-500 text-xs"}>
            {saved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const ThinkingBubble = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-2 px-4">
        <Text className="text-[#4A90D9] mt-4 text-xs font-bold tracking-widest">CPTAN AI</Text>
      </View>
      <Animated.View
        style={[animatedStyle]}
        className="self-start min-w-[120px]"
      >
        <Text className="text-gray-300 text-sm px-4 font-medium">Thinking...</Text>
      </Animated.View>
    </View>
  );
};

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
  onStop,
  sending,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  onStop: () => void;
  sending: boolean;
}) => (
  <View className="px-4 py-4 border-t border-[#1E2D45] bg-[#111827]">
    <View className="flex-row items-center gap-3">
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

      <TouchableOpacity
        onPress={sending ? onStop : onSend}
        disabled={!sending && !value.trim()}
        className={`w-10 h-10 rounded-full items-center justify-center ${sending ? "bg-red-600" : (value.trim() ? "bg-[#2563EB]" : "bg-[#334155]")
          }`}
      >
        {sending ? (
          <Square size={14} color="white" fill="white" />
        ) : (
          <SendHorizontal size={18} color="white" />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

// ─── History Item ─────────────────────────────────────────────────────────────

const HistoryItem = React.memo(({
  item,
  onPress
}: {
  item: Conversation;
  onPress: (id: number) => void;
}) => {
  const date = useMemo(() => new Date(item.updated_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }), [item.updated_at]);

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      className="mb-3 bg-[#1B2A3C] p-4 rounded-xl border border-[#2D3D52]"
    >
      <Text className="text-white font-medium text-sm mb-1" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-gray-400 text-xs">{date}</Text>
    </TouchableOpacity>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    text: "Hello. I'm Guardian Ai — trained on close protection doctrine, procedures, and operational best practices. Ask me anything about CP, or choose a quick topic below.",
    timestamp: "09:08",
  },
];

const mapBackendMessage = (msg: any): Message => {
  const date = new Date(msg.created_at);
  const timestamp = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
  return {
    id: String(msg.id),
    role: msg.role === "ai" ? "ai" : "user",
    text: msg.text,
    timestamp,
  };
};

export default function Guardian() {
  const isFocused = useIsFocused();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamCleanupRef = useRef<(() => void) | null>(null);

  const {
    ref: historySheetRef,
    isOpen: historySheetOpen,
    present: presentHistorySheet,
    dismiss: dismissHistorySheet,
  } = useBottomSheet();

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
      }
    };
  }, []);

  const handleNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    setConversationId(null);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const list = await getConversations();
        if (isMounted) {
          setConversations(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    if (historySheetOpen) {
      setLoadingHistory(true);
      fetchHistory();
    } else {
      setConversations([]);
      setLoadingHistory(false);
    }

    return () => {
      isMounted = false;
    };
  }, [historySheetOpen]);

  const handleOpenHistory = () => {
    presentHistorySheet();
  };

  const handleSelectConversation = async (convId: number) => {
    dismissHistorySheet();
    setSending(true);
    try {
      const historyMessages = await getConversationMessages(convId);
      const mapped = historyMessages.map(mapBackendMessage);
      setMessages(mapped.length > 0 ? mapped : INITIAL_MESSAGES);
      setConversationId(convId);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const renderHistoryItem = useCallback(({ item }: { item: Conversation }) => (
    <HistoryItem item={item} onPress={handleSelectConversation} />
  ), [handleSelectConversation]);

  const handleCopy = async (message: Message) => {
    await Clipboard.setStringAsync(message.text);
    setCopiedMessageId(message.id);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedMessageId(null);
    }, 1500);
  };

  const handleSave = async (message: Message) => {
    setSavingMessageId(message.id);
    try {
      await createNote({
        content: message.text,
        conversation_id: conversationId
      });
      setSavedMessageId(message.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMessageId(null);
    }

    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }
    savedTimeoutRef.current = setTimeout(() => {
      setSavedMessageId(null);
    }, 2000);
  };

  const handleStop = () => {
    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }
    setSending(false);
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || sending) return;

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

    const aiMsgId = `${Date.now()}-ai`;
    const aiMsgPlaceholder: Message = {
      id: aiMsgId,
      role: "ai",
      text: "",
      timestamp: "",
    };

    setMessages((prev) => [...prev, userMsg, aiMsgPlaceholder]);
    setInput("");
    setSending(true);

    const cleanup = llmChatStream(
      messageText,
      conversationId,
      (chunk, convId) => {
        setConversationId(convId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? { ...msg, text: msg.text + chunk, timestamp }
              : msg
          )
        );
      },
      (convId) => {
        setConversationId(convId);
        setSending(false);
        streamCleanupRef.current = null;
      },
      (err) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                ...msg,
                text: "Sorry — I couldn’t reach the server. Please try again.",
                timestamp,
              }
              : msg
          )
        );
        setSending(false);
        streamCleanupRef.current = null;
      }
    );

    streamCleanupRef.current = cleanup;
  };

  const displayedMessages = messages.length > 1
    ? messages.filter((msg) => msg.id !== "1")
    : messages;

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0F1824]">
      {isFocused && <StatusBar style="light" />}

      <Header onHistoryPress={handleOpenHistory} onNewChatPress={handleNewChat} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"padding"}
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
            {messages.length > 1 && <View className="h-6" />}
            {displayedMessages.map((msg, index) =>
              msg.role === "ai" ? (
                msg.text !== "" ? (
                  <AIMessage
                    key={msg.id}
                    message={msg}
                    onCopy={() => void handleCopy(msg)}
                    onSave={() => void handleSave(msg)}
                    copied={copiedMessageId === msg.id}
                    saved={savedMessageId === msg.id}
                    saving={savingMessageId === msg.id}
                    isStreaming={sending && index === displayedMessages.length - 1}
                  />
                ) : null
              ) : (
                <UserMessage key={msg.id} message={msg} />
              )
            )}
            {sending && messages[messages.length - 1]?.role === "ai" && messages[messages.length - 1]?.text === "" && <ThinkingBubble />}

            {messages.length === 1 && <QuickTopics onSelect={sendMessage} />}
          </ScrollView>
        </TouchableWithoutFeedback>

        <InputBar
          value={input}
          onChange={setInput}
          onSend={() => void sendMessage()}
          onStop={handleStop}
          sending={sending}
        />
      </KeyboardAvoidingView>

      <AppBottomSheet
        ref={historySheetRef}
        title="Chat History"
        snapPoints={["60%", "90%"]}
        enableDynamicSizing={false}
      >
        {loadingHistory ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#60A5FA" />
          </View>
        ) : (
          <BottomSheetFlatList
            data={conversations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 20 }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === "android"}
            ListEmptyComponent={
              historySheetOpen && !loadingHistory && conversations.length === 0 ? (
                <View className="py-12 items-center justify-center">
                  <Text className="text-gray-400 text-sm">No past conversations found</Text>
                </View>
              ) : null
            }
            renderItem={renderHistoryItem}
          />
        )}
      </AppBottomSheet>
    </SafeAreaView>
  );
}