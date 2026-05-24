import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Download } from "lucide-react-native";
import { exportReportToPDF } from "../utils/pdf-export";
import ReportDetail from "../components/ui/ReportDetail";
import { AnimatedPage } from "../components/ui";

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <AnimatedPage>
        <View className="px-5 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-[#1f2937] font-semibold ml-2 text-base">Back to Checklist</Text>
      </View>

      <ReportDetail reportData={reportData} />

      <View className="absolute bottom-0 w-full bg-white px-5 py-5 border-t border-gray-100 flex-row gap-4">
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
      </AnimatedPage>
    </SafeAreaView>
  );
}

