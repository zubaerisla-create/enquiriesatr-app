import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AnimatedPage } from "../../../components/ui";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  SendHorizontal,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  Copy,
  Paperclip,
  Mic,
} from "lucide-react-native";

import { useAuth } from "../../../hooks/useAuth";
import { getMessages, getWsUrl, type ChatMessage } from "../../../lib/chat";

interface HeaderProps {
  status: "connecting" | "connected" | "disconnected";
  onBack: () => void;
}

const Header = ({ status, onBack }: HeaderProps) => {
  const getStatusColor = () => {
    return "bg-green-400";
  };

  const getStatusText = () => {
    return "Active";
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E2D45] bg-[#0F1824]">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onBack}
          className="w-9 h-9 rounded-full border border-[#2D3748] items-center justify-center mr-1"
        >
          <ArrowLeft size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <View>
          <Text className="text-white font-bold text-base leading-tight">Live Chat Support</Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Text className="text-gray-400 text-xs">{getStatusText()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface InputBarProps {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  isConnected: boolean;
}

const InputBar = ({ value, onChange, onSend, isConnected }: InputBarProps) => (
  <View className="px-4 py-4 border-t border-[#1E2D45] bg-[#111827]">
    <View className="flex-row items-center gap-3">
      <TextInput
        className="flex-1 bg-[#1F2A3C] text-gray-300 text-sm px-4 py-3 rounded-2xl"
        placeholder="Type a message..."
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
        onPress={onSend}
        disabled={!isConnected || !value.trim()}
        className={`w-9 h-9 rounded-xl items-center justify-center ${value.trim() && isConnected ? "bg-[#2563EB]" : "bg-transparent"
          }`}
      >
        <SendHorizontal size={18} color="white" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function LiveChat() {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError(false);
        const data = await getMessages(50, 0);
        if (active) {
          setMessages(data.results);
        }
      } catch (err) {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let active = true;

    function connect() {
      if (!active) return;

      setStatus("connecting");
      if (!accessToken) return;
      const url = getWsUrl(accessToken);
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (active) {
          setStatus("connected");
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "message" && payload.data) {
            const data = payload.data;
            const newMsg: ChatMessage = {
              id: data.message_id,
              text: data.text,
              sender_id: data.sender_id,
              is_read: true,
              created_at: data.created_at,
            };
            if (active) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) {
                  return prev;
                }
                return [newMsg, ...prev];
              });
            }
          }
        } catch (err) {
          console.error(err);
        }
      };

      ws.onerror = () => {
        if (active) {
          setStatus("disconnected");
        }
      };

      ws.onclose = () => {
        if (active) {
          setStatus("disconnected");
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      active = false;
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [accessToken]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    Keyboard.dismiss();
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      event: "message",
      data: {
        text: input.trim(),
      },
    };

    wsRef.current.send(JSON.stringify(payload));
    setInput("");
  };

  const handleCopy = async (text: string, id: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedMessageId(id);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedMessageId(null);
    }, 1500);
  };

  const isConnected = status === "connected";

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0F1824]">
      {isFocused && <StatusBar style="light" />}
      <Header status={status} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <AnimatedPage>
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#60A5FA" />
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center px-6">
                <AlertCircle size={48} color="#EF4444" />
                <Text className="text-white text-base font-bold text-center mt-4 mb-2">
                  Failed to Load History
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  We couldn't load your chat messages. Please check your connection and try again.
                </Text>
              </View>
            ) : messages.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6">
                <MessageSquare size={48} color="#4A90D9" />
                <Text className="text-white text-base font-bold text-center mt-4 mb-2">
                  No Messages Yet
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  Send a message below to start a live conversation with our support team.
                </Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                {[...messages].reverse().map((item) => {
                  const isUser = item.sender_id === user?.id;
                  const date = new Date(item.created_at);
                  const timestamp = `${String(date.getHours()).padStart(2, "0")}:${String(
                    date.getMinutes()
                  ).padStart(2, "0")}`;

                  return (
                    <View key={item.id} className={`mb-4 px-4 ${isUser ? "items-end" : "items-start"}`}>
                      <View
                        className={`${isUser ? "bg-[#2A4A6B] rounded-tr-sm" : "bg-[#1B3558] rounded-tl-sm"
                          } rounded-2xl p-4 max-w-[80%]`}
                      >
                        <Text className="text-white text-sm leading-6">{item.text}</Text>
                      </View>
                      {isUser ? (
                        <Text className="text-gray-500 text-[10px] mt-1 mr-1">{timestamp}</Text>
                      ) : (
                        <View className="flex-row items-center gap-3 mt-1 px-1">
                          <Text className="text-gray-500 text-[10px]">{timestamp}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <InputBar
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isConnected={isConnected}
          />
        </AnimatedPage>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
