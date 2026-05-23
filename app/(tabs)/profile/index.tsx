import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../../hooks/useAuth";
import AlertModal from "../../../components/ui/AlertModal";
import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "../../../lib/stats";
import Svg, { Circle } from "react-native-svg";

import {
  LucideIcon,
  BookOpen,
  CheckCircle,
  Sparkles,
  Flame,
  FileText,
  Folder,
  Target,
  CreditCard,
  Settings,
  LifeBuoy,
  ShieldCheck,
  LogOut,
  Award,
  ClipboardList
} from "lucide-react-native";

// ─── Stat item ────────────────────────────────────────────────────────────────

interface StatItem {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { icon: BookOpen, iconColor: "#E05252", value: "12", label: "Lessons Done" },
  { icon: CheckCircle, iconColor: "#F5A623", value: "1", label: "Modules\nComplete" },
  { icon: Sparkles, iconColor: "#5B8DEF", value: "34", label: "AI Chats" },
  { icon: Flame, iconColor: "#4CAF82", value: "7", label: "Day Streak" },
];

// ─── Menu row ─────────────────────────────────────────────────────────────────

interface MenuRow {
  icon: LucideIcon;
  label: string;
  badge?: { text: string; color: string; bg: string };
  danger?: boolean;
  route?: string;
  onPress?: () => void;
}

const CONTENT_ROWS: MenuRow[] = [
  { icon: FileText, label: "My Notes", badge: { text: "3", color: "#fff", bg: "#E05252" }, route: "/profile/my-notes" },
  { icon: Folder, label: "My Documents", route: "/profile/my-documents" },
  { icon: Target, label: "Assessments", badge: { text: "1/6 passed", color: "#4CAF82", bg: "#0D2318" }, route: "/profile/assessments" },
];

const ACCOUNT_ROWS: MenuRow[] = [
  { icon: CreditCard, label: "Subscription & Billing", route: "/profile/subscription-billing" },
  { icon: Settings, label: "Settings", route: "/profile/settings" },
];

const SUPPORT_ROWS: MenuRow[] = [
  { icon: LifeBuoy, label: "Help & Support", route: "/profile/help-support" },
  { icon: ShieldCheck, label: "Terms & Conditions", route: "/profile/terms-condition" },
  { icon: LogOut, label: "Log Out", danger: true },
];

// ─── Circular progress ────────────────────────────────────────────────────────

const CircularProgress = ({ percent }: { percent: number }) => {
  const size = 56;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ * (1 - Math.min(Math.max(percent, 0), 100) / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#2D3748"
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#E05252"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: "absolute" }}>
        <Text className="text-white text-xs font-bold">{percent}%</Text>
      </View>
    </View>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCell = ({ stat }: { stat: StatItem }) => (
  <View className="items-center flex-1">
    <View className="mb-1">
      <stat.icon size={20} color={stat.iconColor} />
    </View>
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
        if (row.onPress) {
          row.onPress();
          return;
        }
        if (row.route) {
          if (row.danger) {
            router.replace(row.route as any);
          } else {
            router.push(row.route as any);
          }
        }
      }}
      className={`flex-row items-center px-4 py-4 ${!isLast ? "border-b border-[#1E2D3D]" : ""
        }`}
    >
      <View className="mr-3">
        <row.icon size={18} color={row.danger ? "#E05252" : "#9CA3AF"} />
      </View>
      <Text
        className={`flex-1 text-sm font-medium ${row.danger ? "text-[#E05252]" : "text-white"
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
  const isFocused = useIsFocused();
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
  });

  React.useEffect(() => {
    if (isFocused) {
      refreshUser().catch(() => { });
      refetchStats().catch(() => { });
    }
  }, [isFocused]);

  const handleLogout = async () => {
    setIsLogoutModalVisible(true);
  };

  const supportRows = SUPPORT_ROWS.map((row) =>
    row.label === "Log Out" ? { ...row, onPress: handleLogout } : row
  );

  const displayName = user?.full_name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
  const email = user?.email || "user@example.com";
  const planLabel = user?.subscription?.plan_name
    ? `${user.subscription.plan_name.toUpperCase()} PLAN`
    : "FREE PLAN";

  const displayStats = [
    { icon: CheckCircle, iconColor: "#F5A623", value: `${statsData?.modules_completed ?? 0}/${statsData?.modules_total ?? 0}`, label: "Modules Complete" },
    { icon: Award, iconColor: "#5B8DEF", value: `${statsData?.avg_quiz_score ?? 0}%`, label: "Avg Score" },
    { icon: Flame, iconColor: "#4CAF82", value: String(statsData?.day_streak ?? 0), label: "Day Streak" },
  ];

  const contentRows = [
    {
      icon: FileText,
      label: "My Notes",
      badge: statsData?.notes_count ? { text: String(statsData.notes_count), color: "#fff", bg: "#E05252" } : undefined,
      route: "/profile/my-notes"
    },
    { icon: Folder, label: "My Documents", route: "/profile/my-documents" },
    { icon: ClipboardList, label: "Tools Log", route: "/profile/tools-log" },
    {
      icon: Target,
      label: "Assessments",
      badge: {
        text: `${statsData?.assessments_passed ?? 0}/${statsData?.assessments_total ?? 0} passed`,
        color: "#4CAF82",
        bg: "#0D2318"
      },
      route: "/profile/assessments"
    },
  ];

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0D1520]">
      {isFocused && <StatusBar style="light" />}

      {/* Sticky User Card */}
      <View className="bg-[#0D1520] z-10 py-4 border-b border-[#1E2D3D]">
        <View className="mx-4">
          <View className="flex-row items-center gap-4">
            {/* Avatar */}
            <View className="w-14 h-14 rounded-2xl bg-[#C0392B] items-center justify-center">
              <Text className="text-white font-bold text-lg">{initials}</Text>
            </View>

            {/* Name + email + plan */}
            <View>
              <Text className="text-white font-bold text-lg">{displayName}</Text>
              <Text className="text-gray-400 text-xs mb-1.5">
                {email}
              </Text>
              <View className="flex-row items-center bg-[#2D1010] border border-[#E05252] rounded-full px-3 py-0.5 self-start">
                <View className="w-1.5 h-1.5 rounded-full bg-[#E05252] mr-1.5" />
                <Text className="text-[#E05252] text-[10px] font-bold tracking-widest">
                  {planLabel}
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
          {displayStats.map((s) => (
            <StatCell key={s.label} stat={s} />
          ))}
        </View>

        {/* Overall progress card */}
        <View className="mx-4 mb-2 bg-[#141E2B] rounded-2xl p-4 flex-row items-center gap-4">
          <CircularProgress percent={statsData?.assessments_total ? Math.round(((statsData.assessments_passed ?? 0) / statsData.assessments_total) * 100) : 0} />
          <View>
            <Text className="text-white font-bold text-base">Overall Progress</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {statsData?.assessments_passed ?? 0}/{statsData?.assessments_total ?? 0} assessments passed
            </Text>
          </View>
        </View>

        {/* Content section */}
        <SectionLabel title="Content" />
        <MenuSection rows={contentRows} />

        {/* Account section */}
        <SectionLabel title="Account" />
        <MenuSection rows={ACCOUNT_ROWS} />

        {/* Support section */}
        <SectionLabel title="Support" />
        <MenuSection rows={supportRows} />
      </ScrollView>

      <AlertModal
        visible={isLogoutModalVisible}
        title="Log Out"
        description="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            setIsLogoutModalVisible(false);
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Error", "Failed to log out. Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        }}
        onCancel={() => setIsLogoutModalVisible(false)}
        variant="danger"
        loading={isLoggingOut}
      />
    </SafeAreaView>
  );
}