import { StatusBar } from "expo-status-bar";
import { Shield, Sparkles } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { GuardianAIIcon } from "../icons";

interface GuardianLoaderProps {
  title?: string;
  steps?: string[];
  iconType?: "guardian" | "sparkles" | "shield";
}

export default function GuardianLoader({
  title = "Guardian is generating your assessment",
  steps = [
    "Analyzing module topics...",
    "Formulating scenario-based questions...",
    "Structuring options and explanations...",
    "Almost ready..."
  ],
  iconType = "guardian",
}: GuardianLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    const timer = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 2500);

    return () => {
      clearInterval(timer);
    };
  }, [steps]);

  const barTranslate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 160],
  });

  const IconComponent =
    iconType === "guardian"
      ? GuardianAIIcon
      : iconType === "shield"
        ? Shield
        : Sparkles;

  return (
    <View style={styles.loadingContainer}>
      <StatusBar style="light" />
      <View style={styles.loadingContent}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.iconGlow,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <IconComponent size={36} color="#ffffff" />
            </View>
          </Animated.View>
        </View>

        <Text style={styles.loadingTitle}>{title}</Text>

        {steps.length > 0 && (
          <Text style={styles.loadingSubtitle}>{steps[loadingStep]}</Text>
        )}

        <View style={styles.loadingBarContainer}>
          <Animated.View
            style={[
              styles.loadingBarFill,
              {
                transform: [{ translateX: barTranslate }],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#131C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  iconGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 130, 246, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  loadingSubtitle: {
    color: "#93C5FD",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    height: 20,
  },
  loadingBarContainer: {
    width: 160,
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 24,
  },
  loadingBarFill: {
    width: 100,
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
});
