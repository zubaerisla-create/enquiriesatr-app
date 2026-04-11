import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// ─── Stat item ────────────────────────────────────────────────────────────────

interface StatItem {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { icon: "□", iconColor: "#E05252", value: "12", label: "Lessons Done" },
  { icon: "◎", iconColor: "#F5A623", value: "1", label: "Modules\nComplete" },
  { icon: "✦", iconColor: "#5B8DEF", value: "34", label: "AI Chats" },
  { icon: "♦", iconColor: "#4CAF82", value: "7", label: "Day Streak" },
];

// ─── Menu row ─────────────────────────────────────────────────────────────────

interface MenuRow {
  icon: string;
  label: string;
  badge?: { text: string; color: string; bg: string };
  danger?: boolean;
  route?: string;
}

const CONTENT_ROWS: MenuRow[] = [
  { icon: "✏️", label: "My Notes", badge: { text: "3", color: "#fff", bg: "#E05252" }, route: "/profile/my-notes" },
  { icon: "📋", label: "My Documents", route: "/profile/my-documents" },
  { icon: "🎯", label: "Assessments", badge: { text: "1/6 passed", color: "#4CAF82", bg: "#0D2318" }, route: "/profile/assessments" },
];

const ACCOUNT_ROWS: MenuRow[] = [
  { icon: "💳", label: "Subscription & Billing", route: "/profile/subscription-billing" },
  { icon: "⚙️", label: "Settings", route: "/profile/settings" },
];

const SUPPORT_ROWS: MenuRow[] = [
  { icon: "❓", label: "Help & Support", route: "/profile/help-support" },
  { icon: "📄", label: "Terms & Conditions", route: "/profile/terms-condition" },
  { icon: "🚪", label: "Log Out", route: "/login", danger: true },
];

// ─── Circular progress ────────────────────────────────────────────────────────

const CircularProgress = ({ percent }: { percent: number }) => {
  const size = 56;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: "#2D3748",
          position: "absolute",
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: "#E05252",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          position: "absolute",
          transform: [{ rotate: "-45deg" }],
        }}
      />
      <Text className="text-white text-xs font-bold">{percent}%</Text>
    </View>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCell = ({ stat }: { stat: StatItem }) => (
  <View className="items-center flex-1">
    <Text style={{ color: stat.iconColor }} className="text-xl mb-1">
      {stat.icon}
    </Text>
    <Text className="text-white font-bold text-lg leading-tight">{stat.value}</Text>
    <Text className="text-gray-500 text-[10px] text-center leading-4 mt-0.5">
      {stat.label}
    </Text>
  </View>
);

const SectionLabel = ({ title }: { title: string }) => (
  <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase px-4 mb-2 mt-5">
    {title}
  </Text>
);

const MenuRowItem = ({ row, isLast }: { row: MenuRow; isLast: boolean }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        if (row.route) {
          if (row.danger) {
            router.replace(row.route as any);
          } else {
            router.push(row.route as any);
          }
        }
      }}
      className={`flex-row items-center px-4 py-4 ${
        !isLast ? "border-b border-[#1E2D3D]" : ""
      }`}
    >
      <Text className="text-lg mr-3">{row.icon}</Text>
      <Text
        className={`flex-1 text-sm font-medium ${
          row.danger ? "text-[#E05252]" : "text-white"
        }`}
      >
        {row.label}
      </Text>
      {row.badge && (
        <View
          style={{ backgroundColor: row.badge.bg }}
          className="px-2 py-0.5 rounded-full mr-2"
        >
          <Text style={{ color: row.badge.color }} className="text-[11px] font-semibold">
            {row.badge.text}
          </Text>
        </View>
      )}
      <Text className="text-gray-500 text-lg">›</Text>
    </TouchableOpacity>
  );
};

const MenuSection = ({ rows }: { rows: MenuRow[] }) => (
  <View className="mx-4 bg-[#141E2B] rounded-2xl overflow-hidden">
    {rows.map((row, i) => (
      <MenuRowItem key={row.label} row={row} isLast={i === rows.length - 1} />
    ))}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      {/* Sticky User Card */}
      <View className="bg-[#0D1520] z-10 pt-12 pb-4 border-b border-[#1E2D3D]">
        <View className="mx-4">
          <View className="flex-row items-center gap-4">
            {/* Avatar */}
            <View className="w-14 h-14 rounded-2xl bg-[#C0392B] items-center justify-center">
              <Text className="text-white font-bold text-lg">JH</Text>
            </View>

            {/* Name + email + plan */}
            <View>
              <Text className="text-white font-bold text-lg">James Harwick</Text>
              <Text className="text-gray-400 text-xs mb-1.5">
                j.harwick@email.com
              </Text>
              <View className="flex-row items-center bg-[#2D1010] border border-[#E05252] rounded-full px-3 py-0.5 self-start">
                <View className="w-1.5 h-1.5 rounded-full bg-[#E05252] mr-1.5" />
                <Text className="text-[#E05252] text-[10px] font-bold tracking-widest">
                  ANNUAL PLAN
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Stats strip */}
        <View className="mx-4 mt-4 mb-4 bg-[#141E2B] rounded-2xl px-3 py-4 flex-row">
          {STATS.map((s) => (
            <StatCell key={s.label} stat={s} />
          ))}
        </View>

        {/* Overall progress card */}
        <View className="mx-4 mb-2 bg-[#141E2B] rounded-2xl p-4 flex-row items-center gap-4">
          <CircularProgress percent={44} />
          <View>
            <Text className="text-white font-bold text-base">Overall Progress</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              12/27 lessons · 1/6 assessments passed
            </Text>
          </View>
        </View>

        {/* Content section */}
        <SectionLabel title="Content" />
        <MenuSection rows={CONTENT_ROWS} />

        {/* Account section */}
        <SectionLabel title="Account" />
        <MenuSection rows={ACCOUNT_ROWS} />

        {/* Support section */}
        <SectionLabel title="Support" />
        <MenuSection rows={SUPPORT_ROWS} />
      </ScrollView>
    </SafeAreaView>
  );
}