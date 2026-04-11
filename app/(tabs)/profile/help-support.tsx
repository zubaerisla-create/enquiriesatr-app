import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { 
  LucideIcon, 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  AlertTriangle 
} from "lucide-react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACT_OPTIONS = [
  {
    id: "chat",
    icon: MessageSquare,
    iconBg: "#0D1828",
    iconColor: "#5B8DEF",
    title: "Live Chat",
    subtitle: "Average response time: 2 hours",
  },
  {
    id: "email",
    icon: Mail,
    iconBg: "#0D1828",
    iconColor: "#5B8DEF",
    title: "Email Support",
    subtitle: "support@cptan.com",
  },
];

const FAQS = [
  { id: "1", question: "What is CPTAN and who is it for?" },
  { id: "2", question: "What does my subscription include?" },
  { id: "3", question: "How does the AI Assistant work?" },
  { id: "4", question: "Are my notes and documents stored securely?" },
  { id: "5", question: "Can I use CPTAN offline?" },
  { id: "6", question: "How do I cancel my subscription?" },
  {
    id: "7",
    question: "I'm a course instructor. Can I access CPTAN for my students?",
  },
];

// ─── Contact Row ─────────────────────────────────────────────────────────────

const ContactRow = ({
  item,
  isLast,
}: {
  item: typeof CONTACT_OPTIONS[0];
  isLast: boolean;
}) => (
  <TouchableOpacity
    className={`flex-row items-center px-4 py-4 ${
      !isLast ? "border-b border-[#1E2D3D]" : ""
    }`}
  >
    {/* Icon */}
    <View
      style={{ backgroundColor: item.iconBg }}
      className="w-10 h-10 rounded-xl items-center justify-center mr-3 border border-[#1E3050]"
    >
      <item.icon size={18} color={item.iconColor} />
    </View>

    {/* Text */}
    <View className="flex-1">
      <Text className="text-white font-semibold text-sm">{item.title}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">{item.subtitle}</Text>
    </View>

    {/* Chevron */}
    <ChevronRight size={18} color="#4B5563" />
  </TouchableOpacity>
);

// ─── FAQ Row ──────────────────────────────────────────────────────────────────

const FaqRow = ({
  item,
  isLast,
}: {
  item: (typeof FAQS)[0];
  isLast: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      className={`px-4 py-4 ${!isLast ? "border-b border-[#1E2D3D]" : ""}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-sm flex-1 pr-3 leading-5">
          {item.question}
        </Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <ChevronRight size={18} color="#4B5563" />
        </View>
      </View>
      {open && (
        <Text className="text-gray-400 text-xs leading-5 mt-2">
          Tap to read the full answer to this question in the support documentation.
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpSupport() {
  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
  


        {/* Contact Support section */}
        <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase px-4 mb-2">
          Contact Support
        </Text>
        <View className="mx-4 mb-5 bg-[#141E2B] rounded-2xl overflow-hidden">
          {CONTACT_OPTIONS.map((item, index) => (
            <ContactRow
              key={item.id}
              item={item}
              isLast={index === CONTACT_OPTIONS.length - 1}
            />
          ))}
        </View>

        {/* FAQ section */}
        <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase px-4 mb-2">
          Frequently Asked Questions
        </Text>
        <View className="mx-4 mb-5 bg-[#141E2B] rounded-2xl overflow-hidden">
          {FAQS.map((item, index) => (
            <FaqRow
              key={item.id}
              item={item}
              isLast={index === FAQS.length - 1}
            />
          ))}
        </View>

        {/* Disclaimer card */}
        <View className="mx-4 bg-[#1A0E0E] border border-[#3D1A1A] rounded-2xl px-4 py-4 flex-row items-start gap-3">
          <AlertTriangle size={20} color="#E05252" style={{ marginTop: 2, flexShrink: 0 }} />
          <Text className="text-gray-400 text-xs leading-5 flex-1">
            CPTAN is a training and operational reference tool. It does not replace formal SIA-accredited CP training, legal advice, or professional operational judgment. Always act within your training, competence, and the law.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}