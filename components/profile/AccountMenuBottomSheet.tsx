import React, { forwardRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  FileText,
  Lock,
  User,
} from "lucide-react-native";
import AppBottomSheet, { AppBottomSheetRef } from "../ui/BottomSheet";
import { useAuth } from "../../hooks/useAuth";
import { rf } from "../../utils/responsive";

interface AccountMenuBottomSheetProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export const AccountMenuBottomSheet = forwardRef<
  AppBottomSheetRef,
  AccountMenuBottomSheetProps
>(({ onEditProfile, onChangePassword }, ref) => {
  const { user } = useAuth();
  const router = useRouter();

  const displayName = user?.full_name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
  const email = user?.email || "";

  const handleEditProfile = () => {
    // @ts-ignore
    ref?.current?.dismiss?.();
    onEditProfile();
  };

  const handleChangePassword = () => {
    // @ts-ignore
    ref?.current?.dismiss?.();
    onChangePassword();
  };

  const handleOpenNotes = () => {
    // @ts-ignore
    ref?.current?.dismiss?.();
    router.push("/profile/my-notes");
  };

  const options = [
    {
      icon: User,
      iconBg: "#2D1010",
      iconColor: "#E05252",
      title: "Edit Profile",
      description: "Update name and profile photo",
      onPress: handleEditProfile,
    },
    {
      icon: Lock,
      iconBg: "#1A1420",
      iconColor: "#A855F7",
      title: "Change Password",
      description: "Update account security password",
      onPress: handleChangePassword,
    },
    {
      icon: FileText,
      iconBg: "#101A24",
      iconColor: "#5C9ECC",
      title: "My Notes",
      description: "View saved briefing & operational notes",
      onPress: handleOpenNotes,
    },
  ];

  return (
    <AppBottomSheet
      ref={ref}
      variant="dark"
      enableDynamicSizing={true}
      showCloseButton={true}
    >
      <View className="px-5 pb-6">
        {/* User Summary Header */}
        <View className="flex-row items-center gap-3.5 pb-4 mb-4 border-b border-[#1E2D3D]">
          <View className="w-13 h-13 rounded-2xl bg-primary items-center justify-center overflow-hidden border border-[#2A374A]" style={{ width: 52, height: 52 }}>
            {user?.photo ? (
              <Image
                source={{ uri: user.photo }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <Text style={{ fontSize: rf(18) }} className="text-white font-bold tracking-widest">
                {initials}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text style={{ fontSize: rf(16) }} className="text-white font-bold" numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={{ fontSize: rf(12) }} className="text-gray-400 mt-0.5" numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        {/* 3 Focused Options */}
        <View className="space-y-2">
          {options.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.75}
              onPress={item.onPress}
              className="flex-row items-center p-3 rounded-xl bg-[#141E2B] mb-2 border border-[#1E2D3D]"
            >
              <View
                style={{ backgroundColor: item.iconBg }}
                className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
              >
                <item.icon size={18} color={item.iconColor} />
              </View>

              <View className="flex-1">
                <Text style={{ fontSize: rf(14) }} className="text-white font-semibold mb-0.5">
                  {item.title}
                </Text>
                <Text style={{ fontSize: rf(11) }} className="text-gray-400" numberOfLines={1}>
                  {item.description}
                </Text>
              </View>

              <ChevronRight size={17} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </AppBottomSheet>
  );
});

export default AccountMenuBottomSheet;
