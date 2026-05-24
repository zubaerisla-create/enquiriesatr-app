import React from "react";
import Animated, { Keyframe, Easing } from "react-native-reanimated";

const slowSlideIn = new Keyframe({
    0: {
        opacity: 0,
        transform: [{ translateX: 50 }],
    },
    100: {
        opacity: 1,
        transform: [{ translateX: 0 }],
        easing: Easing.out(Easing.exp),
    },
}).duration(500);

interface WrapperProps {
    children: React.ReactNode;
}

export default function TabScreenWrapper({ children }: WrapperProps) {
    return (
        <Animated.View
            entering={slowSlideIn}
            style={{ flex: 1 }}
        >
            {children}
        </Animated.View>
    );
}