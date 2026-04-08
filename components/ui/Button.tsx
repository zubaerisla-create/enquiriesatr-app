import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  className = "",
  textClassName = "",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[#D82C15]";
      case "secondary":
        return "bg-[#1a1a1a]";
      case "outline":
        return "bg-transparent border border-[#1a1a1a]";
      default:
        return "bg-[#D82C15]";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
        return "text-[#1a1a1a]";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className={`h-[56px] rounded-xl flex-row items-center justify-center px-6 ${getVariantStyles()} ${className} ${
        loading ? "opacity-70" : ""
      }`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#1a1a1a" : "white"} />
      ) : (
        <Text
          className={`text-lg font-bold tracking-wider uppercase ${getTextColor()} ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
