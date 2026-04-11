import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { 
  Check, 
  Star, 
  Zap, 
  ChevronRight 
} from "lucide-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanKey = "trial" | "monthly" | "annual";

// ─── Feature rows ─────────────────────────────────────────────────────────────

const TRIAL_FEATURES = [
  "3 lessons",
  "Limited AI queries",
  "No operational tools",
];

const MONTHLY_FEATURES = [
  "All 30 lessons",
  "Unlimited AI queries",
  "All operational tools",
  "Offline access",
  "Community access",
];

const ANNUAL_FEATURES = [
  "Everything in Monthly",
  "Save 44% vs monthly",
  "Priority AI responses",
  "Early access to new content",
  "Certificate of completion",
];

// ─── Check item ───────────────────────────────────────────────────────────────

const CheckItem = ({
  text,
  muted,
  color = "#4CAF82",
}: {
  text: string;
  muted?: boolean;
  color?: string;
}) => (
  <View className="flex-row items-center gap-2 mb-1.5">
    <Check size={14} color={muted ? "#4B5563" : color} strokeWidth={3} />
    <Text className={`text-sm ${muted ? "text-gray-600" : "text-gray-300"}`}>
      {text}
    </Text>
  </View>
);

// ─── Trial Card ───────────────────────────────────────────────────────────────

const TrialCard = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-4 mb-3 rounded-2xl p-4 border ${
      selected ? "border-gray-400 bg-[#1A2030]" : "border-[#2D3748] bg-[#141E2B]"
    }`}
  >
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2">
        {/* Radio */}
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            selected ? "border-gray-400" : "border-[#3D4F62]"
          }`}
        >
          {selected && (
            <View className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          )}
        </View>
        <Text className="text-gray-400 font-bold text-base tracking-wider uppercase">
          Trial
        </Text>
      </View>
      <Text className="text-gray-500 font-semibold text-base">Free</Text>
    </View>
    {TRIAL_FEATURES.map((f) => (
      <CheckItem key={f} text={f} muted />
    ))}
  </TouchableOpacity>
);

// ─── Monthly Card ─────────────────────────────────────────────────────────────

const MonthlyCard = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-4 mb-3 rounded-2xl p-4 border ${
      selected ? "border-[#3B5FBF] bg-[#131D30]" : "border-[#1E3050] bg-[#131D30]"
    }`}
  >
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2">
        {/* Radio */}
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            selected ? "border-[#5B8DEF]" : "border-[#2A3D5E]"
          }`}
        >
          {selected && (
            <View className="w-2.5 h-2.5 rounded-full bg-[#5B8DEF]" />
          )}
        </View>
        <Text className="text-white font-extrabold text-base tracking-wider uppercase">
          Monthly
        </Text>
      </View>
      <View className="flex-row items-end gap-0.5">
        <Text className="text-[#5B8DEF] font-bold text-lg">£14.99</Text>
        <Text className="text-gray-500 text-xs mb-0.5">/month</Text>
      </View>
    </View>

    {MONTHLY_FEATURES.map((f) => (
      <CheckItem key={f} text={f} color="#5B8DEF" />
    ))}

    {/* CTA */}
    <TouchableOpacity className="mt-4 border border-[#2A3D5E] rounded-xl py-3 items-center">
      <Text className="text-gray-400 text-sm font-semibold">Choose Monthly</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Annual Card ──────────────────────────────────────────────────────────────

const AnnualCard = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-4 mb-3 rounded-2xl p-4 border-2 ${
      selected ? "border-[#E05252] bg-[#1A0A0A]" : "border-[#C0392B] bg-[#1A0A0A]"
    }`}
  >
    {/* RECOMMENDED badge */}
    <View className="absolute -top-3 right-4 bg-[#E05252] rounded-full px-3 py-0.5 flex-row items-center gap-1">
      <Star size={10} color="white" fill="white" />
      <Text className="text-white text-[10px] font-bold tracking-widest">RECOMMENDED</Text>
    </View>

    {/* Header row */}
    <View className="flex-row items-center justify-between mb-3 mt-1">
      <View className="flex-row items-center gap-2">
        {/* Radio */}
        <View className="w-5 h-5 rounded-full border-2 border-[#E05252] items-center justify-center">
          {selected && (
            <View className="w-2.5 h-2.5 rounded-full bg-[#E05252]" />
          )}
        </View>
        <Text className="text-white font-extrabold text-base tracking-wider uppercase">
          Annual
        </Text>
        {/* Save badge */}
        <View className="bg-[#D4A843] rounded-full px-2 py-0.5">
          <Text className="text-black text-[10px] font-bold">Save £75.89</Text>
        </View>
      </View>
      <View className="flex-row items-end gap-0.5">
        <Text className="text-white font-extrabold text-xl">£99.99</Text>
        <Text className="text-gray-500 text-xs mb-0.5">/year</Text>
      </View>
    </View>

    {ANNUAL_FEATURES.map((f) => (
      <CheckItem key={f} text={f} color="#E05252" />
    ))}

    {/* CTA */}
    <TouchableOpacity className="mt-4 bg-[#E05252] rounded-xl py-3.5 flex-row items-center justify-center gap-2">
      <Zap size={16} color="white" fill="white" />
      <Text className="text-white font-bold text-sm">Choose Annual</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UpgradeAccess() {
  const [selected, setSelected] = useState<PlanKey>("annual");

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
 

        {/* Page header */}
        <View className="px-4 mb-6">
      
          <Text className="text-gray-500 text-sm mt-2 leading-5">
            Full access to all 30 lessons, unlimited AI queries, and all operational tools.
          </Text>
        </View>

        {/* Plan cards */}
        <TrialCard   selected={selected === "trial"}   onPress={() => setSelected("trial")} />
        <MonthlyCard selected={selected === "monthly"} onPress={() => setSelected("monthly")} />
        <AnnualCard  selected={selected === "annual"}  onPress={() => setSelected("annual")} />

        {/* Legal note */}
        <Text className="text-gray-600 text-xs text-center px-8 mt-2 leading-5">
          Cancel anytime. Billed through the App Store. Prices shown in GBP and may vary by region.
        </Text>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-[#0D1520]">
        <TouchableOpacity className="bg-[#E05252] rounded-2xl py-4 flex-row items-center justify-center gap-2">
          <Zap size={18} color="white" fill="white" />
          <Text className="text-white font-bold text-sm tracking-widest uppercase">
            Continue with Annual
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}