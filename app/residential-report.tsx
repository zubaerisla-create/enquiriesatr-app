import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Download, Shield, ShieldAlert, ShieldCheck } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { exportReportToPDF } from "../utils/pdf-export";

const statusColor = (s: string) => {
  const normS = (s || "").toUpperCase();
  if (normS === "COMPROMISED") return { text: "#D82C15", bg: "#2D1010", border: "#D82C15", iconColor: "#D82C15", Icon: ShieldAlert };
  if (normS === "SECURE WITH EXCEPTIONS") return { text: "#F5A623", bg: "#2A1E08", border: "#F5A623", iconColor: "#F5A623", Icon: Shield };
  return { text: "#22C55E", bg: "#0A1F0F", border: "#22C55E", iconColor: "#22C55E", Icon: ShieldCheck };
};

export default function ResidentialReport() {
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
    llm_overall_status,
    llm_handover_summary,
    llm_action_items
  } = reportData;

  const styleConf = statusColor(llm_overall_status);
  const StatusIcon = styleConf.Icon;

  const handleExport = async () => {
    const mapped = {
      llm_overall_risk: llm_overall_status,
      llm_key_findings: [llm_handover_summary],
      llm_overall_summary: llm_handover_summary,
      llm_recommended_actions: llm_action_items || []
    };
    await exportReportToPDF(mapped);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="px-5 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-[#1f2937] font-semibold ml-2 text-base">Back to Checklist</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">
          <Text className="text-[#131C2E] text-2xl font-black uppercase tracking-wider mb-1">
            Handover Report
          </Text>
          <Text className="text-gray-400 text-sm mb-5">
            Shift completion & cordon integrity analysis
          </Text>

          <View className="bg-[#131C2E] rounded-2xl p-5 mb-6 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
                Overall Cordon Status
              </Text>
              <View
                style={{ backgroundColor: styleConf.bg, borderColor: styleConf.border }}
                className="border rounded-xl px-4 py-2 self-start"
              >
                <Text style={{ color: styleConf.text }} className="font-black text-lg tracking-wider uppercase">
                  {llm_overall_status}
                </Text>
              </View>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-[#1E2D45] items-center justify-center">
              <StatusIcon size={24} color={styleConf.iconColor} />
            </View>
          </View>

          <Text className="text-[#131C2E] font-black text-base mb-4">Handover Summary</Text>
          <View
            style={{ backgroundColor: styleConf.bg + '1A', borderColor: styleConf.border + '40' }}
            className="border rounded-2xl p-5 mb-6"
          >
            <Text className="text-[#4B5563] text-sm italic leading-6">
              {llm_handover_summary}
            </Text>
          </View>

          <Text className="text-[#131C2E] font-black text-base mb-4">Action Items for Relief Shift</Text>
          <View className="mb-6">
            {llm_action_items && llm_action_items.length > 0 ? (
              llm_action_items.map((item: string, i: number) => (
                <View key={i} className="flex-row items-start mb-3">
                  <View className="w-6 h-6 rounded bg-[#D82C15] items-center justify-center mr-3 mt-0.5">
                    <Text className="text-white font-bold text-xs">{i + 1}</Text>
                  </View>
                  <Text className="text-[#4B5563] text-sm leading-6 flex-1">{item}</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-400 text-sm">No specific action items noted for the relief shift.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-10 w-full bg-white px-5 py-5 border-t border-gray-100 flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-[#F4F9F6] py-4 rounded-xl items-center border border-[#E0EBE4]"
        >
          <Text className="text-[#131C2E] font-semibold text-sm">Back to Checklist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleExport}
          className="flex-1 bg-[#131C2E] py-4 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Download size={16} color="white" />
          <Text className="text-white font-bold text-sm">Export Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
