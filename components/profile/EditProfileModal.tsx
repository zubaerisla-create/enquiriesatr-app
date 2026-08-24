import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { User as UserIcon, X, Check, Camera } from "lucide-react-native";
import { useAuth } from "../../hooks/useAuth";
import { updateUserProfile } from "../../lib/auth";
import { rf, rs } from "../../utils/responsive";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && user) {
      setFullName(user.full_name || "");
      setSelectedImage(null);
      setError("");
    }
  }, [visible, user]);

  const initials = (fullName || user?.full_name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access your photos is required to update your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setError("");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append("full_name", fullName.trim());

        const filename = selectedImage.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

        // @ts-ignore: React Native FormData accepts an object with uri, name, type
        formData.append("photo", {
          uri: selectedImage,
          name: filename,
          type: type,
        });

        await updateUserProfile(formData);
      } else {
        await updateUserProfile({ full_name: fullName.trim() });
      }

      await refreshUser();
      Alert.alert("Success", "Profile updated successfully.");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayPhoto = selectedImage || user?.photo;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6 pb-3 border-b border-[#1E2D3D]">
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-lg bg-[#2D1010] items-center justify-center">
                <UserIcon size={18} color="#E05252" />
              </View>
              <Text style={{ fontSize: rf(16) }} className="text-white font-bold">
                Edit Profile
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Avatar Preview & Photo Picker */}
          <View className="items-center mb-6">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
              className="relative"
            >
              <View className="w-22 h-22 rounded-full bg-primary items-center justify-center overflow-hidden border-2 border-[#2A374A]" style={{ width: 84, height: 84 }}>
                {displayPhoto ? (
                  <Image
                    source={{ uri: displayPhoto }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={{ fontSize: rf(26) }} className="text-white font-bold tracking-widest">
                    {initials}
                  </Text>
                )}
              </View>

              {/* Floating Camera Icon Badge */}
              <View className="absolute bottom-0 right-0 bg-[#C0392B] w-7 h-7 rounded-full items-center justify-center border-2 border-[#0D1520]">
                <Camera size={14} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} className="mt-2.5">
              <Text style={{ fontSize: rf(12) }} className="text-[#E05252] font-semibold">
                Change Photo
              </Text>
            </TouchableOpacity>

            <Text style={{ fontSize: rf(11) }} className="text-gray-500 mt-1">
              {user?.email}
            </Text>
          </View>

          {/* Full Name Input */}
          <View className="mb-5">
            <Text style={{ fontSize: rf(12) }} className="text-gray-400 font-bold uppercase tracking-wider mb-2">
              Full Name
            </Text>
            <View
              style={{ height: rs(50) }}
              className="flex-row items-center px-4 rounded-xl bg-[#141E2B] border border-[#2A374A]"
            >
              <TextInput
                style={{ fontSize: rf(15) }}
                className="flex-1 h-full text-white"
                placeholder="Enter your full name"
                placeholderTextColor="#6B7280"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (error) setError("");
                }}
                autoCapitalize="words"
              />
            </View>
            {error ? (
              <Text style={{ fontSize: rf(11) }} className="text-red-400 mt-1.5 font-medium">
                {error}
              </Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              style={{ height: rs(46) }}
              className="flex-1 rounded-xl bg-[#141E2B] border border-[#1E2D3D] items-center justify-center"
            >
              <Text style={{ fontSize: rf(13) }} className="text-gray-300 font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={{ height: rs(46) }}
              className="flex-1 rounded-xl bg-[#C0392B] items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View className="flex-row items-center gap-1.5">
                  <Check size={16} color="white" strokeWidth={2.5} />
                  <Text style={{ fontSize: rf(13) }} className="text-white font-bold">
                    Save
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#0D1520",
    borderWidth: 1,
    borderColor: "#1E2D3D",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default EditProfileModal;
