import React from "react";
import { View, Text, ScrollView } from "react-native";

interface ReportData {
  llm_overall_risk: string;
  llm_key_findings: string | string[];
  llm_overall_summary: string;
  llm_recommended_actions: string[];
}

interface ReportDetailProps {
  reportData: ReportData;
  title?: string;
  subtitle?: string;
}

const severityColor = (s: string) => {
  const normS = (s || "").toUpperCase();
  if (normS === "HIGH" || normS === "CRITICAL" || normS === "RED") return { text: "#D82C15", bg: "#2D1010", border: "#D82C15" };
  if (normS === "MEDIUM" || normS === "AMBER") return { text: "#F5A623", bg: "#2A1E08", border: "#F5A623" };
  return { text: "#22C55E", bg: "#0A1F0F", border: "#22C55E" };
};

export default function ReportDetail({
  reportData,
  title = "Risk Report",
  subtitle = "Based on your threat assessment checklist"
}: ReportDetailProps) {
  const {
    llm_overall_risk,
    llm_key_findings,
    llm_overall_summary,
    llm_recommended_actions
  } = reportData;

  const riskCol = severityColor(llm_overall_risk);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-6">
        <Text className="text-[#131C2E] text-2xl font-black uppercase tracking-wider mb-1">
          {title}
        </Text>
        <Text className="text-gray-400 text-sm mb-5">
          {subtitle}
        </Text>

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
  );
}
