import React from "react";
import { View } from "react-native";

interface WrapperProps {
    children: React.ReactNode;
}

export default function TabScreenWrapper({ children }: WrapperProps) {
    return (
        <View style={{ flex: 1 }}>
            {children}
        </View>
    );
}