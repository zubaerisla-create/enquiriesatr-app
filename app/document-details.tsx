import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Download } from "lucide-react-native";
import { api } from "../lib/api";
import { exportReportToPDF } from "../utils/pdf-export";
import ReportDetail from "../components/ui/ReportDetail";
import { AnimatedPage } from "../components/ui";

export default function DocumentDetails() {
  const { id, type, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await api.get("/users/document/details/", {
          params: { type, id },
          requireAuth: true,
        });
        setReportData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id, type]);

  const handleExport = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      await exportReportToPDF(reportData);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <AnimatedPage>
        <View className="px-5 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-[#1f2937] font-semibold ml-2 text-base">Back to Documents</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E05252" />
        </View>
      ) : reportData ? (
        <ReportDetail 
          reportData={reportData} 
          title={typeof title === "string" ? title : "Risk Report"}
          subtitle={type === "ROUTE_RECCE_REPORT" ? "Route Recce Briefing" : "Based on your threat assessment checklist"}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-gray-500 mb-4">Failed to load document details.</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-[#131C2E] px-6 py-3 rounded-xl">
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && reportData && (
        <View className="absolute bottom-10 w-full bg-white px-5 py-5 border-t border-gray-100 flex-row gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-[#F4F9F6] py-4 rounded-xl items-center border border-[#E0EBE4]"
          >
            <Text className="text-[#131C2E] font-semibold text-sm">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting}
            className="flex-1 bg-[#131C2E] py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            {exporting ? (
              <ActivityIndicator size={16} color="white" />
            ) : (
              <Download size={16} color="white" />
            )}
            <Text className="text-white font-bold text-sm">Export Report</Text>
          </TouchableOpacity>
        </View>
      )}
      </AnimatedPage>
    </SafeAreaView>
  );
}
