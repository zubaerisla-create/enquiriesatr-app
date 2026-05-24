import React, { useEffect } from "react";
import { Animated, Image, useWindowDimensions, View } from "react-native";
import { wp } from "../utils/responsive";



import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../hooks/useAuth";

// Hook used inside component


export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { loadSession, isBootstrapping, accessToken } = useAuth();

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    loadSession();
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const timer = setTimeout(() => {
      if (accessToken) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [accessToken, isBootstrapping, router]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar style="dark" />
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/images/logo.jpeg")}
          style={{ width: wp(40), height: wp(40) }}
          resizeMode="contain"
        />

        <View className="mt-8">
          <View
            style={{ width: wp(40) }}
            className="h-1 bg-gray-100 rounded-full overflow-hidden"
          >

            <Animated.View
              className="h-full bg-[#D82C15]"
              style={{
                width: '100%',
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-wp(40), 0]
                  })

                }]
              }}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
