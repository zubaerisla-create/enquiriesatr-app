import React, { useEffect } from "react";
import { View, Image, Animated, useWindowDimensions } from "react-native";
import { rs, wp } from "../utils/responsive";



import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Hook used inside component


export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();

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

    const timer = setTimeout(() => {
      // Navigate to onboarding after 2.5 seconds
      router.replace("/(onboarding)");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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
