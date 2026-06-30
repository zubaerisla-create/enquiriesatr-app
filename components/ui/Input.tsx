import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { rs, rf } from "../../utils/responsive";


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
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text 
          style={{ fontSize: rf(14) }}
          className="text-dark font-bold mb-2 ml-1"
        >
          {label}
        </Text>

      )}
      <View
        style={{ height: rs(56) }}
        className={`flex-row items-center px-4 rounded-xl bg-gray-100 border ${
          isFocused ? "border-primary bg-white" : "border-gray-200"
        } ${error ? "border-red-500" : ""}`}
      >

        <TextInput
          style={{ fontSize: rf(16) }}
          className="flex-1 h-full text-dark"

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
              size={rs(20)}
              color="#9ca3af"
            />

          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text 
          style={{ fontSize: rf(12) }}
          className="text-red-500 mt-1 ml-1 font-medium"
        >
          {error}
        </Text>
      )}

    </View>
  );
};

export default Input;
