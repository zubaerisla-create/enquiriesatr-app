import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { rs, rf } from "../../utils/responsive";


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
        return "bg-primary";
      case "secondary":
        return "bg-dark";
      case "outline":
        return "bg-transparent border border-dark";
      default:
        return "bg-primary";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
        return "text-dark";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{ height: rs(56) }}
      className={`rounded-xl flex-row items-center justify-center px-6 ${getVariantStyles()} ${className} ${
        loading ? "opacity-70" : ""
      }`}
      activeOpacity={0.8}
    >

      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#1a1a1a" : "white"} />
      ) : (
        <Text
          style={{ fontSize: rf(18) }}
          className={`font-bold tracking-wider uppercase ${getTextColor()} ${textClassName}`}
        >
          {title}
        </Text>

      )}
    </TouchableOpacity>
  );
};

export default Button;
