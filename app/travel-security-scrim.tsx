import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Check, ChevronDown, Save } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AnimatedPage } from "../components/ui";
import { api } from "../lib/api";

const SHAPE_OPTIONS = [
  "Saloon",
  "Hatchback",
  "Estate",
  "SUV/4x4",
  "Van",
  "Motorcycle",
  "Bus/Truck"
];

export default function TravelSecurityScrim() {
  const [shape, setShape] = useState("");
  const [colour, setColour] = useState("");
  const [registration, setRegistration] = useState("");
  const [identifyingFeatures, setIdentifyingFeatures] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [directionOfTravel, setDirectionOfTravel] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!shape) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select a vehicle shape.",
        position: "top"
      });
      return;
    }
    if (!colour.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter the vehicle colour.",
        position: "top"
      });
      return;
    }
    if (!registration.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter the vehicle registration.",
        position: "top"
      });
      return;
    }
    if (!identifyingFeatures.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please describe any identifying features.",
        position: "top"
      });
      return;
    }
    if (!makeModel.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter the make and model.",
        position: "top"
      });
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/operative-tools/scrim-log/",
        {
          shape,
          colour: colour.trim(),
          registration: registration.trim(),
          identifying_features: identifyingFeatures.trim(),
          make_model: makeModel.trim(),
          direction_of_travel: directionOfTravel.trim()
        },
        { requireAuth: true }
      );

      setShape("");
      setColour("");
      setRegistration("");
      setIdentifyingFeatures("");
      setMakeModel("");
      setDirectionOfTravel("");
      setDropdownOpen(false);

      Toast.show({
        type: "success",
        text1: "Vehicle Logged Successfully",
        text2: "The SCRIM record has been recorded.",
        position: "top"
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error.message || "Failed to log suspicious vehicle.",
        position: "top"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-white">

      <KeyboardAvoidingView
        behavior={"padding"}
        className="flex-1 bg-white"
      >
        <StatusBar style="light" />
        <AnimatedPage>
          <View className="bg-[#0D1520] pt-14 pb-0">
            <View className="px-5 pb-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center mb-6"
              >
                <ArrowLeft size={20} color="#9ca3af" />
                <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
              </TouchableOpacity>

              <View className="flex-row items-end justify-between mb-2">
                <Text className="text-white text-2xl font-black uppercase tracking-wider">
                  Vehicle SCRIM
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-5 pt-4 bg-white"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            <Text className="text-gray-400 text-sm mb-6">
              Log suspicious vehicles using the SCRIM method.
            </Text>

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              S - Shape *
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-4 shadow-inner"
            >
              <Text className={shape ? "text-gray-800 text-sm" : "text-[#94A3B8] text-sm"}>
                {shape || "Select vehicle shape..."}
              </Text>
              <ChevronDown size={18} color="#94A3B8" />
            </TouchableOpacity>

            {dropdownOpen && (
              <View className="bg-white border border-gray-200 rounded-xl mb-4 p-2 shadow-lg">
                {SHAPE_OPTIONS.map((option) => {
                  const isSelected = shape === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setShape(option);
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-3 rounded-lg flex-row items-center justify-between ${isSelected ? "bg-gray-50" : ""
                        }`}
                    >
                      <Text className="text-gray-800 text-sm font-medium">{option}</Text>
                      {isSelected && <Check size={16} color="#D82C15" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              C - Colour *
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-4"
              placeholder="e.g. Dark Blue, Silver"
              placeholderTextColor="#94A3B8"
              value={colour}
              onChangeText={setColour}
            />

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              R - Registration *
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-4"
              placeholder="Full or partial plates"
              placeholderTextColor="#94A3B8"
              value={registration}
              onChangeText={setRegistration}
              autoCapitalize="characters"
            />

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              I - Identifying Features *
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-4"
              placeholder="Damage, stickers, tinted windows, roof racks"
              placeholderTextColor="#94A3B8"
              value={identifyingFeatures}
              onChangeText={setIdentifyingFeatures}
              multiline
              numberOfLines={3}
              style={{ textAlignVertical: "top", height: 80 }}
            />

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              M - Make and Model *
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-4"
              placeholder="e.g. BMW 3 Series, Ford Transit"
              placeholderTextColor="#94A3B8"
              value={makeModel}
              onChangeText={setMakeModel}
            />

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              Direction of Travel / Activity
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-4"
              placeholder="e.g. Heading North, pacing convoy"
              placeholderTextColor="#94A3B8"
              value={directionOfTravel}
              onChangeText={setDirectionOfTravel}
            />
          </ScrollView>

          <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 items-center justify-between gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#D82C15] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              {loading ? (
                <ActivityIndicator size={18} color="white" />
              ) : (
                <>
                  <Save size={18} color="white" />
                  <Text className="text-white font-bold tracking-wide">
                    LOG SUSPICIOUS VEHICLE
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedPage>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
