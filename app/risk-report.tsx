import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ArrowLeft, Download } from "lucide-react-native";

const KEY_FINDINGS = [
  "All 38 checklist items completed (100%)",
  "15 high-severity items identified",
  "15 medium-severity items identified",
  "8 sections fully completed",
];

const IDENTIFIED_RISKS = [
  { severity: "HIGH", text: "Security personnel are stationed at all access points" },
  { severity: "HIGH", text: "Emergency exits are clearly marked and accessible" },
  { severity: "MEDIUM", text: "Number of entry points is clearly identified" },
  { severity: "MEDIUM", text: "Bag checks or screening procedures are in place" },
  { severity: "LOW", text: "Number of exit points is clearly identified" },
  { severity: "HIGH", text: "Entry and exit points are properly separated" },
  { severity: "HIGH", text: "Number of entry points is clearly identified" },
  { severity: "MEDIUM", text: "Number of exit points is close to identified" },
  { severity: "HIGH", text: "Security personnel are stationed at all access points" },
  { severity: "HIGH", text: "Entry and exit points are properly separated" },
  { severity: "MEDIUM", text: "Bag checks or screening procedures are in place" },
];

const RECOMMENDED_ACTIONS = [
  "Address all high-severity items immediately",
  "Develop mitigation plans for medium-severity concerns",
  "Complete remaining checklist items for incomplete sections",
  "Schedule regular reassessments to maintain security standards",
  "Document all corrective actions taken",
];

const severityColor = (s: string) => {
  if (s === "HIGH" || s === "CRITICAL") return { text: "#D82C15", bg: "#2D1010", border: "#D82C15" };
  if (s === "MEDIUM") return { text: "#F5A623", bg: "#2A1E08", border: "#F5A623" };
  return { text: "#22C55E", bg: "#0A1F0F", border: "#22C55E" };
};

export default function RiskReport() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-[#1f2937] font-semibold ml-2 text-base">Back to Checklist</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">

          {/* Title */}
          <Text className="text-[#131C2E] text-2xl font-black uppercase tracking-wider mb-1">
            AI-Generated Risk Report
          </Text>
          <Text className="text-gray-400 text-sm mb-5">
            Based on your threat assessment checklist
          </Text>

          {/* Overall Threat Level Card */}
          <View className="bg-[#131C2E] rounded-2xl p-5 mb-6">
            <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
              Overall Risk Level
            </Text>
            <View className="bg-[#2D1010] border border-[#D82C15] rounded-xl px-4 py-2 self-start">
              <Text className="text-[#D82C15] font-black text-2xl tracking-widest">High</Text>
            </View>
          </View>

          {/* Key Findings */}
          <Text className="text-[#131C2E] font-black text-base mb-4">Key Findings</Text>
          <View className="bg-[#F4F9F6] border border-[#E0EBE4] rounded-2xl p-5 mb-6">
            {KEY_FINDINGS.map((f, i) => (
              <View key={i} className="flex-row items-start mb-3">
                <View className="w-1.5 h-1.5 rounded-full bg-[#131C2E] mt-1.5 mr-3" />
                <Text className="text-[#374151] text-sm leading-5 flex-1">{f}</Text>
              </View>
            ))}
          </View>

          {/* Identified Risks */}
          <Text className="text-[#131C2E] font-black text-base mb-4">Identified Risks</Text>
          <View className="mb-6">
            {IDENTIFIED_RISKS.map((risk, i) => {
              const col = severityColor(risk.severity);
              return (
                <View key={i} className="flex-row items-start gap-3 mb-3 pb-3 border-b border-gray-100">
                  <View
                    style={{ backgroundColor: col.bg, borderColor: col.border }}
                    className="px-2 py-0.5 rounded border self-start mt-0.5"
                  >
                    <Text style={{ color: col.text }} className="text-[9px] font-black tracking-widest">
                      {risk.severity}
                    </Text>
                  </View>
                  <Text className="text-[#4B5563] text-sm leading-5 flex-1">{risk.text}</Text>
                </View>
              );
            })}
          </View>

          {/* Recommended Actions */}
          <Text className="text-[#131C2E] font-black text-base mb-4">Recommended Actions</Text>
          <View className="mb-6">
            {RECOMMENDED_ACTIONS.map((action, i) => (
              <View key={i} className="flex-row items-start mb-3">
                <View className="w-6 h-6 rounded bg-[#D82C15] items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white font-bold text-xs">{i + 1}</Text>
                </View>
                <Text className="text-[#4B5563] text-sm leading-6 flex-1">{action}</Text>
              </View>
            ))}
          </View>

          {/* Overall Summary */}
          <Text className="text-[#131C2E] font-black text-base mb-4">Overall Assessment Summary</Text>
          <View className="bg-[#FFF0F0] border border-[#FCA5A5] rounded-2xl p-5 mb-6">
            <Text className="text-[#4B5563] text-sm italic leading-6">
              Based on the threat assessment, the venue presents a{" "}
              <Text className="font-bold text-[#D82C15]">high-risk</Text> profile due to several unresolved
              high-severity items. Immediate attention should be given to high-severity items, with a comprehensive
              action plan developed for medium-severity concerns. Regular monitoring and reassessments are recommended
              to maintain security standards. Ensure all corrective actions are documented and addressing any
              outstanding risks promptly.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 w-full bg-white px-5 py-5 border-t border-gray-100 flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-[#F4F9F6] py-4 rounded-xl items-center border border-[#E0EBE4]"
        >
          <Text className="text-[#131C2E] font-semibold text-sm">Back to Checklist</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-[#131C2E] py-4 rounded-xl flex-row items-center justify-center gap-2">
          <Download size={16} color="white" />
          <Text className="text-white font-bold text-sm">Export Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
