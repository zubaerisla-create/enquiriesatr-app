import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api";
import AlertModal from "../../../components/ui/AlertModal";
import {
  LucideIcon,
  Bell,
  BookOpen,
  AlertTriangle,
  ChevronRight,
} from "lucide-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationSetting {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "new_content_added",
    icon: Bell,
    iconBg: "#2D1010",
    iconColor: "#E05252",
    title: "New Content Alerts",
    description: "Get notified when new lessons or resources are added",
  },
  {
    id: "lessons",
    icon: BookOpen,
    iconBg: "#0D1828",
    iconColor: "#5B8DEF",
    title: "Lesson Reminders",
    description: "Daily reminders to continue your training",
  },
  {
    id: "streak",
    icon: Bell,
    iconBg: "#2D2510",
    iconColor: "#D4A843",
    title: "Streak Alerts",
    description: "Notify me if I'm at risk of losing my streak",
  },
];

// ─── Custom Toggle ────────────────────────────────────────────────────────────
// Uses React Native's Switch styled to match the red toggle in the screenshot

const RedToggle = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    trackColor={{ false: "#2D3748", true: "#C0392B" }}
    thumbColor={value ? "#FFFFFF" : "#6B7280"}
    ios_backgroundColor="#2D3748"
    style={Platform.OS === "android" ? { transform: [{ scale: 1.1 }] } : {}}
  />
);

// ─── Notification Row ─────────────────────────────────────────────────────────

const NotificationRow = ({
  item,
  value,
  onToggle,
  isLast,
}: {
  item: NotificationSetting;
  value: boolean;
  onToggle: (v: boolean) => void;
  isLast: boolean;
}) => (
  <View
    className={`flex-row items-center px-4 py-4 ${!isLast ? "border-b border-[#1E2D3D]" : ""
      }`}
  >
    {/* Icon */}
    <View
      style={{ backgroundColor: item.iconBg }}
      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
    >
      <item.icon size={18} color={item.iconColor} />
    </View>

    {/* Text */}
    <View className="flex-1 mr-3">
      <Text className="text-white font-semibold text-sm mb-0.5">{item.title}</Text>
      <Text className="text-gray-500 text-xs leading-4">{item.description}</Text>
    </View>

    {/* Toggle */}
    <RedToggle value={value} onValueChange={onToggle} />
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Settings() {
  const { deleteUserAccount } = useAuth();
  const router = useRouter();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    new_content_added: true,
    lessons: true,
    streak: true,
  });
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPreferences = async () => {
      try {
        const response = await api.get<{
          new_content_added: boolean;
          lesson_reminder: boolean;
          streak_alert: boolean;
        }>("/notifications/preferance/", { requireAuth: true });
        if (active) {
          setToggles({
            new_content_added: response.data.new_content_added,
            lessons: response.data.lesson_reminder,
            streak: response.data.streak_alert,
          });
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load notification preferences.");
      } finally {
        if (active) {
          setLoadingPreferences(false);
        }
      }
    };
    loadPreferences();
    return () => {
      active = false;
    };
  }, []);

  const handleToggle = async (id: string, val: boolean) => {
    setToggles((prev) => ({ ...prev, [id]: val }));
    const fieldMap: Record<string, string> = {
      new_content_added: "new_content_added",
      lessons: "lesson_reminder",
      streak: "streak_alert",
    };
    const field = fieldMap[id];
    if (!field) return;
    try {
      await api.patch(
        "/notifications/preferance/update/",
        { [field]: val },
        { requireAuth: true }
      );
    } catch (err) {
      setToggles((prev) => ({ ...prev, [id]: !val }));
      Alert.alert("Error", "Failed to update preference. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalVisible(true);
  };

  if (loadingPreferences) {
    return (
      <View className="flex-1 bg-[#0D1520] items-center justify-center">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#C0392B" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >



        {/* Notifications section */}
        <View className="mx-4 mb-4 bg-[#141E2B] rounded-2xl overflow-hidden">
          {/* Section label */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
              Notifications
            </Text>
          </View>

          {/* Rows */}
          {NOTIFICATION_SETTINGS.map((item, index) => (
            <NotificationRow
              key={item.id}
              item={item}
              value={toggles[item.id]}
              onToggle={(v) => handleToggle(item.id, v)}
              isLast={index === NOTIFICATION_SETTINGS.length - 1}
            />
          ))}
        </View>

        {/* Danger Zone section */}
        <View className="mx-4 bg-[#1A0E0E] border border-[#3D1A1A] rounded-2xl overflow-hidden">
          {/* Section label */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-[#E05252] text-[10px] font-bold tracking-widest uppercase">
              Danger Zone
            </Text>
          </View>

          {/* Delete Account row */}
          <TouchableOpacity onPress={handleDeleteAccount} className="flex-row items-center px-4 py-4">
            {/* Icon */}
            <View className="w-10 h-10 rounded-xl bg-[#2D1010] items-center justify-center mr-3">
              <AlertTriangle size={18} color="#E05252" />
            </View>

            {/* Text */}
            <View className="flex-1">
              <Text className="text-[#E05252] font-semibold text-sm mb-0.5">
                Delete Account
              </Text>
              <Text className="text-gray-500 text-xs leading-4">
                Permanently delete your account and all data
              </Text>
            </View>

            {/* Chevron */}
            <ChevronRight size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AlertModal
        visible={isDeleteModalVisible}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account and all data? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deleteUserAccount();
            setIsDeleteModalVisible(false);
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Error", "Failed to delete account. Please try again.");
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        variant="danger"
        loading={isDeleting}
      />
    </View>
  );
}