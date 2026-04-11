import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  FileText, 
  Save 
} from "lucide-react-native";

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, text: "Establish outer perimeter with two operatives", status: "done" },
  { id: 2, text: "Brief all team members on search pattern and communication signals", status: "done" },
  { id: 3, text: "Secure and clear the entry point", status: "done" },
  { id: 4, text: "Assign two-person search teams per floor", status: "active" },
  { id: 5, text: "Clear ground floor — room by room, left to right", status: "pending" },
  { id: 6, text: "Check all concealment areas (wardrobes, under furniture, crawl spaces)", status: "pending" },
  { id: 7, text: "Secure all cleared rooms — close and mark", status: "pending" },
  { id: 8, text: "Repeat process for upper floors", status: "pending" },
  { id: 9, text: "Check roof access, loft, and external areas", status: "pending" },
  { id: 10, text: "Conduct final sweep with search dog if available", status: "pending" },
  { id: 11, text: "Declare premises clear — signal principal advance", status: "pending" },
  { id: 12, text: "Post standing guard at entry point", status: "pending" },
  { id: 13, text: "Document search findings and log completion time", status: "pending" },
  { id: 14, text: "File operational report", status: "pending" },
];

export default function ToolDetails() {
  const [threatLevel, setThreatLevel] = useState<"routine" | "elevated">("routine");

  const completedSteps = STEPS.filter(s => s.status === "done").length;
  const totalSteps = STEPS.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      
      {/* Header (Dark) */}
      <View className="bg-[#0D1520] pt-14 pb-0">
        <View className="px-5 pb-5">
          {/* Back Navigation */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={20} color="#9ca3af" />
            <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
          </TouchableOpacity>

          {/* Tags & Progress text */}
          <View className="flex-row items-end justify-between mb-2">
            <View className="border border-[#D82C15]/30 bg-[#D82C15]/10 px-3 py-1 rounded-full">
              <Text className="text-[#D82C15] text-[10px] font-bold tracking-widest uppercase">
                Operations
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 text-xs font-medium">
                {completedSteps}/{totalSteps} steps
              </Text>
              <Text className="text-[#D82C15] text-sm font-bold mt-0.5">
                {progressPercent}%
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-black uppercase tracking-wider mb-4">
            Search Operations
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-1 bg-[#2D3748] w-full flex-row">
          <View 
            style={{ width: `${progressPercent}%` }} 
            className="h-full bg-[#D82C15]" 
          />
        </View>
      </View>

      {/* Content (Scrollable) */}
      <ScrollView 
        className="flex-1 px-5 pt-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* AI Prompt Box */}
        <View className="bg-[#141A24] rounded-xl p-4 mb-4">
          <Text className="text-white text-sm mb-4">
            <Text className="text-yellow-500 font-bold">AI: </Text>
            Is this a routine inspection or elevated threat level?
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => setThreatLevel("routine")}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                threatLevel === "routine" ? "bg-[#2E8B57]" : "bg-[#1A2230] border border-[#2D3748]"
              }`}
            >
              <Text className="text-white font-bold text-sm">Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setThreatLevel("elevated")}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                threatLevel === "elevated" ? "bg-[#D82C15]" : "bg-[#1A2230] border border-[#2D3748]"
              }`}
            >
              <Text className="text-gray-300 font-medium text-sm">Elevated</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Checklist */}
        {STEPS.map((step) => {
          let pillClasses = "";
          let textClasses = "";
          let checkboxContent = null;
          let idStr = String(step.id).padStart(2, '0');

          if (step.status === "done") {
             pillClasses = "bg-[#F4F9F6] border border-[#E0EBE4] opacity-80";
             textClasses = "text-gray-400 line-through";
             checkboxContent = (
               <View className="w-5 h-5 rounded bg-[#3B82F6] items-center justify-center bg-[#2E8B57]">
                 <Check size={12} color="white" strokeWidth={3} />
               </View>
             );
          } else if (step.status === "active") {
             pillClasses = "bg-white border text-black border-[#D82C15]";
             textClasses = "text-gray-700 font-medium";
             checkboxContent = <View className="w-5 h-5 rounded border border-[#D82C15] bg-white" />;
          } else {
             pillClasses = "bg-[#141A24] border border-transparent";
             textClasses = "text-white";
             checkboxContent = <View className="w-5 h-5 rounded border border-[#2D3748] bg-transparent" />;
          }

          return (
            <TouchableOpacity 
              key={step.id} 
              activeOpacity={0.8}
              className={`flex-row items-center px-4 py-3.5 rounded-xl mb-2 ${pillClasses}`}
            >
              {checkboxContent}
              <Text className={`text-[10px] ml-3 mr-2 font-medium ${step.status === 'done' ? 'text-gray-400' : 'text-gray-500'}`}>
                {idStr}
              </Text>
              <Text className={`flex-1 text-sm ${textClasses}`}>
                {step.text}
              </Text>
              {step.status === "done" && step.id === 3 && (
                <ChevronRight size={16} color="#9ca3af" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer Fixed Action Buttons */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 pb-8 items-center justify-between gap-4">
        <TouchableOpacity className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center gap-2">
          <FileText size={16} color="white" />
          <Text className="text-white font-semibold">Report</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.navigate("/tool-complete")}
          className="flex-1 bg-[#D82C15] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Save size={18} color="white" />
          <Text className="text-white font-bold tracking-wide">COMPLETE & SAVE</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
