import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Download } from "lucide-react-native";
import { exportReportToPDF } from "../utils/pdf-export";

const severityColor = (s: string) => {
  const normS = (s || "").toUpperCase();
  if (normS === "HIGH" || normS === "CRITICAL") return { text: "#D82C15", bg: "#2D1010", border: "#D82C15" };
  if (normS === "MEDIUM") return { text: "#F5A623", bg: "#2A1E08", border: "#F5A623" };
  return { text: "#22C55E", bg: "#0A1F0F", border: "#22C55E" };
};

export default function RiskReport() {
  const { report } = useLocalSearchParams();
  const reportData = report ? JSON.parse(report as string) : null;

  if (!reportData) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-5">
        <Text className="text-gray-500 mb-4">No report data found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#131C2E] px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    llm_overall_risk,
    llm_key_findings,
    llm_overall_summary,
    llm_recommended_actions
  } = reportData;

  const riskCol = severityColor(llm_overall_risk);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-[#1f2937] font-semibold ml-2 text-base">Back to Checklist</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">

          {/* Title */}
          <Text className="text-[#131C2E] text-2xl font-black uppercase tracking-wider mb-1">
            Risk Report
          </Text>
          <Text className="text-gray-400 text-sm mb-5">
            Based on your threat assessment checklist
          </Text>

          {/* Overall Threat Level Card */}
          <View className="bg-[#131C2E] rounded-2xl p-5 mb-6">
            <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
              Overall Risk Level
            </Text>
            <View
              style={{ backgroundColor: riskCol.bg, borderColor: riskCol.border }}
              className="border rounded-xl px-4 py-2 self-start"
            >
              <Text style={{ color: riskCol.text }} className="font-black text-2xl tracking-widest">
                {llm_overall_risk}
              </Text>
            </View>
          </View>

          {/* Key Findings */}
          <Text className="text-[#131C2E] font-black text-base mb-4">Key Findings</Text>
          <View className="mb-6">
            {Array.isArray(llm_key_findings) ? (
              llm_key_findings.map((finding: string, i: number) => (
                <View key={i} className="flex-row items-start mb-3 bg-[#F4F9F6] border border-[#E0EBE4] rounded-xl p-4">
                  <View className="w-5 h-5 rounded-full bg-[#131C2E] items-center justify-center mr-3 mt-0.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-white" />
                  </View>
                  <Text className="text-[#374151] text-sm leading-6 flex-1">
                    {finding}
                  </Text>
                </View>
              ))
            ) : (
              <View className="bg-[#F4F9F6] border border-[#E0EBE4] rounded-2xl p-5">
                <Text className="text-[#374151] text-sm leading-6">
                  {llm_key_findings}
                </Text>
              </View>
            )}
          </View>

          {/* Recommended Actions */}
          <Text className="text-[#131C2E] font-black text-base mb-4">Recommended Actions</Text>
          <View className="mb-6">
            {llm_recommended_actions.map((action: string, i: number) => (
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
          <View
            style={{ backgroundColor: riskCol.bg + '1A', borderColor: riskCol.border + '40' }}
            className="border rounded-2xl p-5 mb-6"
          >
            <Text className="text-[#4B5563] text-sm italic leading-6">
              {llm_overall_summary}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-10 w-full bg-white px-5 py-5 border-t border-gray-100 flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-[#F4F9F6] py-4 rounded-xl items-center border border-[#E0EBE4]"
        >
          <Text className="text-[#131C2E] font-semibold text-sm">Back to Checklist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => exportReportToPDF(reportData)}
          className="flex-1 bg-[#131C2E] py-4 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Download size={16} color="white" />
          <Text className="text-white font-bold text-sm">Export Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
