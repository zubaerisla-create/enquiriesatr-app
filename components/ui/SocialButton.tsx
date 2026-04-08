import React from "react";
import { TouchableOpacity, Text, Image, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface SocialButtonProps {
  type: "google" | "apple";
  onPress: () => void;
  className?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ type, onPress, className = "" }) => {
  const isGoogle = type === "google";
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 h-[60px] flex-row items-center justify-center rounded-xl bg-gray-50 border border-gray-200 ${className}`}
      activeOpacity={0.7}
    >
      <View className="mr-3">
        {isGoogle ? (
            // Using an icon as placeholder for Google logo if image is not handy
          <FontAwesome name="google" size={24} color="#DB4437" />
        ) : (
          <FontAwesome name="apple" size={24} color="#1a1a1a" />
        )}
      </View>
      <Text className="text-[#1a1a1a] font-bold text-lg">
        {isGoogle ? "Google" : "Apple"}
      </Text>
    </TouchableOpacity>
  );
};

export default SocialButton;
