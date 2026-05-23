import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ArrowLeft, Download, Save, Check, Shield } from "lucide-react-native";
import { api } from "../lib/api";
import { exportReportToPDF } from "../utils/pdf-export";
import ReportDetail from "../components/ui/ReportDetail";
import { GuardianLoader, AnimatedPage } from "../components/ui";

const STANDARD_ZONES = [
  "Perimeter & Parking",
  "Access Control & Entrances",
  "Main Venue / Crowd Area",
  "Holding / Safe Room",
  "Emergency Procedures"
];

interface ZoneState {
  zone_name: string;
  rag_rating: "Red" | "Amber" | "Green";
  findings: string;
}

export default function VenueSecurityRAG() {
  const [venueName, setVenueName] = useState("");
  const [zones, setZones] = useState<ZoneState[]>(
    STANDARD_ZONES.map(z => ({
      zone_name: z,
      rag_rating: "Green",
      findings: ""
    }))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const handleRatingChange = (index: number, rating: "Red" | "Amber" | "Green") => {
    const updated = [...zones];
    updated[index].rag_rating = rating;
    setZones(updated);
  };

  const handleFindingsChange = (index: number, text: string) => {
    const updated = [...zones];
    updated[index].findings = text;
    setZones(updated);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!venueName.trim()) {
      Alert.alert("Missing Field", "Please enter the Venue Name.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/operative-tools/venue-rag-generate/",
        {
          venue_name: venueName,
          zones: zones
        },
        { requireAuth: true }
      );
      setResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Generation Failed", "Failed to generate venue security report.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const pdfData = {
        llm_overall_risk: result.overall_status,
        llm_key_findings: result.zones.map((z: any) => `${z.zone_name} - ${z.rag_rating.toUpperCase()}: ${z.findings}`),
        llm_overall_summary: result.llm_summary,
        llm_recommended_actions: [
          "Review specific zone findings and recommendations.",
          "Ensure corrective action plans are created for RED and AMBER zones.",
          "Brief the close protection team on the venue's overall vulnerabilities.",
        ]
      };
      await exportReportToPDF(pdfData);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const getRAGTextStyle = (rating: "Red" | "Amber" | "Green", option: "Red" | "Amber" | "Green") => {
    if (rating !== option) {
      return "text-black font-medium";
    }
    if (option === "Red") return "text-[#D82C15] font-bold";
    if (option === "Amber") return "text-[#F5A623] font-bold";
    return "text-[#2E8B57] font-semibold";
  };

  if (loading) {
    return (
      <GuardianLoader
        title="Guardian is generating your report"
        steps={[
          "Analyzing venue zones...",
          "Evaluating RAG statuses...",
          "Compiling protective recommendations...",
          "Almost ready..."
        ]}
        iconType="shield"
      />
    );
  }

  return (
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
              Venue Security RAG
            </Text>
          </View>
        </View>

      </View>

      {result ? (
        <View className="flex-1 bg-white">
          <ReportDetail
            reportData={{
              llm_overall_risk: result.overall_status,
              llm_key_findings: result.zones.map((z: any) => `${z.zone_name} - ${z.rag_rating.toUpperCase()}: ${z.findings}`),
              llm_overall_summary: result.llm_summary,
              llm_recommended_actions: [
                "Review specific zone findings and recommendations.",
                "Ensure corrective action plans are created for RED and AMBER zones.",
                "Brief the close protection team on the venue's overall vulnerabilities.",
              ]
            }}
            title={result.venue_name}
            subtitle="Venue Security Assessment RAG Report"
          />

          <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 pb-8 items-center justify-between gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleExport}
              disabled={exporting}
              className="flex-1 bg-[#D82C15] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              {exporting ? (
                <ActivityIndicator size={16} color="white" />
              ) : (
                <Download size={16} color="white" />
              )}
              <Text className="text-white font-bold tracking-wide">EXPORT PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 bg-white">
          <ScrollView
            className="flex-1 px-5 pt-4 bg-white"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            <Text className="text-gray-400 text-sm mb-6">
              Perform RAG assessment and outline findings for security zones
            </Text>

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
              Venue Name
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-6"
              placeholder="Enter Venue Name..."
              placeholderTextColor="#94A3B8"
              value={venueName}
              onChangeText={setVenueName}
            />

            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-4">
              Zones Assessment
            </Text>

            {zones.map((zone, idx) => (
              <View
                key={zone.zone_name}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-4 shadow-sm"
              >
                <Text className="text-gray-800 font-bold text-sm uppercase tracking-wide mb-3">
                  {zone.zone_name}
                </Text>

                <View className="flex-row gap-2 mb-3">
                  {(["Red", "Amber", "Green"] as const).map(option => {
                    const isSelected = zone.rag_rating === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleRatingChange(idx, option)}
                        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg border bg-[#F4F9F6] border-[#E0EBE4]`}
                      >
                        <View className={`w-3.5 h-3.5 rounded-full items-center justify-center border mr-1.5  ${isSelected
                          ? option === "Red" ? "bg-[#D82C15] border-[#D82C15]" : option === "Amber" ? "bg-[#F5A623] border-[#F5A623]" : "bg-[#2E8B57] border-[#2E8B57]"
                          : "bg-transparent border-[#2D3748]"
                          }`}>
                          {isSelected && <Check size={8} color="white" strokeWidth={4} />}
                        </View>
                        <Text className={`text-xs ${getRAGTextStyle(zone.rag_rating, option)}`}>
                          {option.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm shadow-inner mt-2"
                  placeholder="Findings & recommendations..."
                  placeholderTextColor="#94A3B8"
                  value={zone.findings}
                  onChangeText={text => handleFindingsChange(idx, text)}
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: "top", height: 70 }}
                />
              </View>
            ))}
          </ScrollView>

          <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 pb-8 items-center justify-between gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-[#D82C15] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Save size={18} color="white" />
              <Text className="text-white font-bold tracking-wide">GENERATE REPORT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </AnimatedPage>
    </KeyboardAvoidingView>
  );
}
