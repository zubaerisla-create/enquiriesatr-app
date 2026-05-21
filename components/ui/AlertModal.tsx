import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LucideIcon, AlertTriangle, Info, CheckCircle2 } from "lucide-react-native";
import { rs, rf } from "../../utils/responsive";

interface AlertModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: "danger" | "info" | "success";
  loading?: boolean;
}

const VARIANT_CONFIGS = {
  danger: {
    icon: AlertTriangle,
    iconBg: "#2D1010",
    iconColor: "#E05252",
    btnBg: "#E05252",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "#0D2318",
    iconColor: "#4CAF82",
    btnBg: "#4CAF82",
  },
  info: {
    icon: Info,
    iconBg: "#0D1828",
    iconColor: "#5B8DEF",
    btnBg: "#5B8DEF",
  },
};

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "info",
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 220,
        friction: 14,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.info;
  const IconComponent = config.icon;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={{ backgroundColor: config.iconBg }} className="w-12 h-12 rounded-2xl items-center justify-center mb-4 self-center">
            <IconComponent size={24} color={config.iconColor} />
          </View>

          <Text style={{ fontSize: rf(18) }} className="text-white font-bold text-center mb-2">
            {title}
          </Text>

          <Text style={{ fontSize: rf(13) }} className="text-gray-400 text-center mb-6 leading-5">
            {description}
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={{ height: rs(48) }}
              className={`flex-1 rounded-xl bg-[#141E2B] border border-[#1E2D3D] items-center justify-center ${loading ? "opacity-50" : ""}`}
            >
              <Text style={{ fontSize: rf(14) }} className="text-gray-300 font-semibold">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={{ height: rs(48), backgroundColor: config.btnBg }}
              className={`flex-1 rounded-xl items-center justify-center ${loading ? "opacity-50" : ""}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ fontSize: rf(14) }} className="text-white font-semibold">
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#0D1520",
    borderWidth: 1,
    borderColor: "#1E2D3D",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
});

export default AlertModal;
