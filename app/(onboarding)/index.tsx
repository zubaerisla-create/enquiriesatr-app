import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, Animated, SafeAreaView, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../../components/ui/Button";

const { width, height } = Dimensions.get("window");

const DATA = [
  {
    id: "1",
    title: "30 PROFESSIONAL LESSONS",
    highlight: "AT YOUR FINGERTIPS",
    description: "Access curated close protection knowledge anytime, anywhere. Built for the modern professional operating in high-stakes environments.",
    image: require("../../assets/images/onboarding_1.jpeg"),
    module: "MODULE 04 // CLOSE PROTECTION FUNDAMENTALS",
    progress: 75,
  },
  {
    id: "2",
    title: "AN AI ASSISTANT THAT",
    highlight: "KNOWS CP INSIDE OUT",
    description: "Get instant tactical advice and procedure guidance in the field. Your virtual operational commander is active 24/7.",
    image: require("../../assets/images/onboarding_2.jpeg"),
    module: "SYSTEM_RESPONSE // ADVICE",
  },
  {
    id: "3",
    title: "PROCEDURES AND TEMPLATES,",
    highlight: "READY WHEN YOU NEED THEM",
    description: "Complete search logs, risk assessments, and checklists on the go. High-speed data entry for high-stakes environments.",
    image: require("../../assets/images/onboarding_3.jpeg"),
    module: "MODULE 03 // OPERATE",
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const router = useRouter();

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push("/(auth)/login");
    }
  };

  const skip = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="flex-row items-center">
          <Image 
            source={require("../../assets/images/logo.jpeg")} 
            className="w-8 h-8 mr-2 mt-4" 
            resizeMode="contain"
          />
          <Text className="pt-10 text-[#D82C15] font-black text-lg italic uppercase">
            ATR GUARDIAN TRAINING
          </Text>
        </View>
        <TouchableOpacity onPress={skip}>
          <Text className="text-gray-400 font-bold uppercase text-xs tracking-tighter">SKIP</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <View style={{ width }} className="px-6 flex-1">
            <View className="flex-1 justify-center items-center">
                <View className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl elevation-10 bg-gray-900 border-4 border-gray-100">
                    <Image 
                        source={item.image} 
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    {/* Mock Overlay from UI Design */}
                    <View className="absolute top-4 left-4 right-4 bg-black/60 p-4 rounded-xl border-l-2 border-[#D82C15]">
                        <Text className="text-white text-[10px] font-bold opacity-60 uppercase mb-1">{item.module}</Text>
                        <Text className="text-white font-bold text-sm uppercase leading-tight">Tactical positioning for high-threat environments.</Text>
                    </View>
                </View>
            </View>

            <View className="py-10">
              <Text className="text-[#1a1a1a] text-4xl font-black uppercase leading-tight">
                {item.title}
              </Text>
              <Text className="text-[#D82C15] text-4xl font-black uppercase leading-tight">
                {item.highlight}
              </Text>
              
              <View className="border-l-2 border-[#D82C15] pl-4 mt-6">
                <Text className="text-gray-500 text-lg leading-relaxed">
                  {item.description}
                </Text>
              </View>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Footer */}
      <View className="px-6 pb-10">
        <View className="flex-row justify-center mb-8">
          {DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 30, 10],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i.toString()}
                className="h-1 bg-[#D82C15] mx-1 rounded-full"
                style={{ width: dotWidth, opacity }}
              />
            );
          })}
        </View>

        <View className="flex-row gap-4">
          {currentIndex > 0 ? (
            <Button
              title="PREVIOUS"
              variant="secondary"
              className="flex-1"
              onPress={() => slidesRef.current?.scrollToIndex({ index: currentIndex - 1 })}
            />
          ) : null}
          <Button
            title={currentIndex === DATA.length - 1 ? "GET STARTED" : "NEXT"}
            className="flex-1"
            onPress={scrollTo}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
