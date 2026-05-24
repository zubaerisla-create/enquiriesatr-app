import { Redirect, Tabs } from "expo-router";
import {
  Home,
  BookOpen,
  Cpu,
  SquareCheck,
  User,
} from "lucide-react-native";
import React, { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rs, rf } from "../../utils/responsive";
import { useAuth } from "../../hooks/useAuth";

function AnimatedTabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.15 : 1, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export default function TabLayout() {
  const { accessToken, isBootstrapping } = useAuth();
  const insets = useSafeAreaInsets();

  if (isBootstrapping) {
    return null;
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarStyle: {
          backgroundColor: "#15202B",
          borderTopColor: "#1a2634",
          borderTopWidth: 1,
          height: rs(70) + insets.bottom,
          paddingBottom: rs(10) + insets.bottom,
          paddingTop: rs(10),
        },
        tabBarActiveTintColor: "#D82C15",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: rf(10),
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Home size={rs(22)} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <BookOpen size={rs(22)} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="guardian"
        options={{
          title: "Guardian",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Cpu size={rs(22)} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <SquareCheck size={rs(22)} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <User size={rs(22)} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}