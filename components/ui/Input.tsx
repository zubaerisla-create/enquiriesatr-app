import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View className={`mb-5 ${className}`}>
      {label && (
        <Text className="text-[#1a1a1a] font-bold text-sm mb-2 ml-1">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center h-[56px] px-4 rounded-xl bg-gray-100 border ${
          isFocused ? "border-[#D82C15] bg-white" : "border-gray-200"
        } ${error ? "border-red-500" : ""}`}
      >
        <TextInput
          className="flex-1 h-full text-base text-[#1a1a1a]"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
