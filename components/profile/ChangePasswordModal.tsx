import React, { useState } from "react";
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
import { Lock, X, Check, Eye, EyeOff } from "lucide-react-native";
import { changePassword } from "../../lib/auth";
import { rf, rs } from "../../utils/responsive";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await changePassword({
        old_password: oldPassword || undefined,
        new_password: newPassword,
      });
      Alert.alert("Success", "Your password has been changed successfully.");
      handleClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.new_password?.[0] ||
        err?.message ||
        "Failed to change password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5 pb-3 border-b border-[#1E2D3D]">
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-lg bg-[#2D1010] items-center justify-center">
                <Lock size={18} color="#E05252" />
              </View>
              <Text style={{ fontSize: rf(16) }} className="text-white font-bold">
                Change Password
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Current Password Field */}
          <View className="mb-4">
            <Text style={{ fontSize: rf(11) }} className="text-gray-400 font-bold uppercase tracking-wider mb-1.5">
              Current Password
            </Text>
            <View
              style={{ height: rs(48) }}
              className="flex-row items-center px-4 rounded-xl bg-[#141E2B] border border-[#2A374A]"
            >
              <TextInput
                style={{ fontSize: rf(14) }}
                className="flex-1 h-full text-white"
                placeholder="Enter current password"
                placeholderTextColor="#6B7280"
                value={oldPassword}
                onChangeText={(text) => {
                  setOldPassword(text);
                  if (error) setError("");
                }}
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} className="p-1">
                {showOldPassword ? (
                  <EyeOff size={18} color="#9CA3AF" />
                ) : (
                  <Eye size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Field */}
          <View className="mb-4">
            <Text style={{ fontSize: rf(11) }} className="text-gray-400 font-bold uppercase tracking-wider mb-1.5">
              New Password (min. 8 chars)
            </Text>
            <View
              style={{ height: rs(48) }}
              className="flex-row items-center px-4 rounded-xl bg-[#141E2B] border border-[#2A374A]"
            >
              <TextInput
                style={{ fontSize: rf(14) }}
                className="flex-1 h-full text-white"
                placeholder="Enter new password"
                placeholderTextColor="#6B7280"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (error) setError("");
                }}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} className="p-1">
                {showNewPassword ? (
                  <EyeOff size={18} color="#9CA3AF" />
                ) : (
                  <Eye size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Field */}
          <View className="mb-5">
            <Text style={{ fontSize: rf(11) }} className="text-gray-400 font-bold uppercase tracking-wider mb-1.5">
              Confirm New Password
            </Text>
            <View
              style={{ height: rs(48) }}
              className="flex-row items-center px-4 rounded-xl bg-[#141E2B] border border-[#2A374A]"
            >
              <TextInput
                style={{ fontSize: rf(14) }}
                className="flex-1 h-full text-white"
                placeholder="Re-enter new password"
                placeholderTextColor="#6B7280"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) setError("");
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#9CA3AF" />
                ) : (
                  <Eye size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
            {error ? (
              <Text style={{ fontSize: rf(11) }} className="text-red-400 mt-2 font-medium leading-4">
                {error}
              </Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={{ height: rs(46) }}
              className="flex-1 rounded-xl bg-[#141E2B] border border-[#1E2D3D] items-center justify-center"
            >
              <Text style={{ fontSize: rf(13) }} className="text-gray-300 font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
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
                    Update
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

export default ChangePasswordModal;
