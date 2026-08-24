import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Download } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GuardianLoader } from "../components/ui";
import ReportDetail from "../components/ui/ReportDetail";
import { api } from "../lib/api";
import { exportReportToPDF } from "../utils/pdf-export";

const THREAT_LEVELS = ["Low", "Medium", "High"] as const;

type ThreatLevel = (typeof THREAT_LEVELS)[number];

type RouteRecceResult = {
    id: number;
    route_name: string;
    threat_level: ThreatLevel;
    primary_route_details: string;
    choke_points_and_hazards: string;
    safe_havens_and_hospitals: string;
    comms_dead_spots: string;
    llm_overall_viability: string;
    llm_route_summary: string;
    llm_contingency_actions: string[];
    created_at: string;
};

const threatColors = (lvl: ThreatLevel) => {
    if (lvl === "High") return { border: "#D82C15", bg: "#2D1010", text: "#D82C15" };
    if (lvl === "Medium") return { border: "#F5A623", bg: "#2A1E08", text: "#F5A623" };
    return { border: "#22C55E", bg: "#0A1F0F", text: "#22C55E" };
};

export default function RouteRecce() {
    const [routeName, setRouteName] = useState("");
    const [threatLevel, setThreatLevel] = useState<ThreatLevel>("Low");
    const [primaryRouteDetails, setPrimaryRouteDetails] = useState("");
    const [chokePointsAndHazards, setChokePointsAndHazards] = useState("");
    const [safeHavensAndHospitals, setSafeHavensAndHospitals] = useState("");
    const [commsDeadSpots, setCommsDeadSpots] = useState("");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RouteRecceResult | null>(null);
    const [exporting, setExporting] = useState(false);

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (!routeName.trim()) {
            Alert.alert("Missing Field", "Please enter the Route Name/Identifier.");
            return;
        }
        if (!primaryRouteDetails.trim()) {
            Alert.alert("Missing Field", "Please enter Primary Route Details.");
            return;
        }
        if (!chokePointsAndHazards.trim()) {
            Alert.alert("Missing Field", "Please enter Choke Points & Hazards.");
            return;
        }
        if (!safeHavensAndHospitals.trim()) {
            Alert.alert("Missing Field", "Please enter Safe Havens & Hospitals.");
            return;
        }
        if (!commsDeadSpots.trim()) {
            Alert.alert("Missing Field", "Please enter Comms Dead Spots.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post<RouteRecceResult>(
                "/operative-tools/route-recce-generate/",
                {
                    route_name: routeName.trim(),
                    threat_level: threatLevel,
                    primary_route_details: primaryRouteDetails.trim(),
                    choke_points_and_hazards: chokePointsAndHazards.trim(),
                    safe_havens_and_hospitals: safeHavensAndHospitals.trim(),
                    comms_dead_spots: commsDeadSpots.trim(),
                },
                { requireAuth: true }
            );
            setResult(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Generation Failed", "Failed to generate Route Recce briefing.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!result) return;
        setExporting(true);
        try {
            const pdfData = {
                llm_overall_risk: result.llm_overall_viability,
                llm_key_findings: [
                    `Route: ${result.route_name}`,
                    `Threat Level: ${result.threat_level}`,
                    `Primary Details: ${result.primary_route_details}`,
                    `Choke Points: ${result.choke_points_and_hazards}`,
                    `Safe Havens: ${result.safe_havens_and_hospitals}`,
                    `Comms: ${result.comms_dead_spots}`
                ],
                llm_overall_summary: result.llm_route_summary,
                llm_recommended_actions: result.llm_contingency_actions
            };
            await exportReportToPDF(pdfData);
        } catch (error) {
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <GuardianLoader
                title="Guardian is generating your route brief"
                steps={[
                    "Reviewing route details...",
                    "Evaluating choke points and hazards...",
                    "Mapping safe havens and comms gaps...",
                    "Compiling contingency actions...",
                ]}
                iconType="guardian"
            />
        );
    }

    return (
        <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={"padding"} className="flex-1 bg-white">
                <StatusBar style="light" />

                <View className="bg-[#0D1520] pt-14 pb-0">
                    <View className="px-5 pb-5">
                        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
                            <ArrowLeft size={20} color="#9ca3af" />
                            <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
                        </TouchableOpacity>

                        <Text className="text-white text-2xl font-black uppercase tracking-wider">
                            Advance Work (Route Recce)
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            Log route hazards to generate a driving brief.
                        </Text>
                    </View>
                </View>

                {result ? (
                    <View className="flex-1 bg-white">
                        <ReportDetail
                            reportData={{
                                llm_overall_risk: result.llm_overall_viability,
                                llm_key_findings: [
                                    `Route: ${result.route_name}`,
                                    `Threat Level: ${result.threat_level}`,
                                    `Primary Details: ${result.primary_route_details}`,
                                    `Choke Points: ${result.choke_points_and_hazards}`,
                                    `Safe Havens: ${result.safe_havens_and_hospitals}`,
                                    `Comms: ${result.comms_dead_spots}`
                                ],
                                llm_overall_summary: result.llm_route_summary,
                                llm_recommended_actions: result.llm_contingency_actions
                            }}
                            title={result.route_name}
                            subtitle="Advance Work (Route Recce) Report"
                        />

                        <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 items-center justify-between gap-4">
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
                                Capture hazards, safe havens and comms gaps for the planned route.
                            </Text>

                            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
                                Route Name/Identifier
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-6"
                                placeholder="e.g. Airport to Hilton Hotel"
                                placeholderTextColor="#94A3B8"
                                value={routeName}
                                onChangeText={setRouteName}
                            />

                            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
                                Assessed Threat Level
                            </Text>
                            <View className="flex-row gap-2 mb-6">
                                {THREAT_LEVELS.map((opt) => {
                                    const isSelected = threatLevel === opt;
                                    const col = threatColors(opt);
                                    return (
                                        <TouchableOpacity
                                            key={opt}
                                            activeOpacity={0.85}
                                            onPress={() => setThreatLevel(opt)}
                                            className="flex-1 py-3 rounded-xl border items-center justify-center"
                                            style={{
                                                backgroundColor: isSelected ? col.bg : "#F4F9F6",
                                                borderColor: isSelected ? col.border : "#E0EBE4",
                                            }}
                                        >
                                            <Text
                                                style={{ color: isSelected ? col.text : "#111827" }}
                                                className="text-[11px] font-extrabold tracking-widest"
                                            >
                                                {opt.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
                                Primary Route Details
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-6"
                                placeholder="Main roads, expected travel time, turn-by-turn overview"
                                placeholderTextColor="#94A3B8"
                                value={primaryRouteDetails}
                                onChangeText={setPrimaryRouteDetails}
                                multiline
                                numberOfLines={4}
                                style={{ textAlignVertical: "top", height: 110 }}
                            />

                            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
                                Choke Points & Hazards
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-6"
                                placeholder="Tunnels, bridges, roadworks, heavy traffic zones"
                                placeholderTextColor="#94A3B8"
                                value={chokePointsAndHazards}
                                onChangeText={setChokePointsAndHazards}
                                multiline
                                numberOfLines={4}
                                style={{ textAlignVertical: "top", height: 110 }}
                            />

                            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
                                Safe Havens & Hospitals
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-6"
                                placeholder="Nearest A&E, police stations on route"
                                placeholderTextColor="#94A3B8"
                                value={safeHavensAndHospitals}
                                onChangeText={setSafeHavensAndHospitals}
                                multiline
                                numberOfLines={4}
                                style={{ textAlignVertical: "top", height: 110 }}
                            />

                            <Text className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">
                                Comms Dead Spots
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner mb-4"
                                placeholder="Areas with no radio or cell signal"
                                placeholderTextColor="#94A3B8"
                                value={commsDeadSpots}
                                onChangeText={setCommsDeadSpots}
                                multiline
                                numberOfLines={4}
                                style={{ textAlignVertical: "top", height: 110 }}
                            />
                        </ScrollView>

                        <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 items-center justify-between gap-4">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center"
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="flex-1 bg-[#D82C15] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
                            >
                                <Text className="text-white font-bold tracking-wide">GENERATE ROUTE BRIEF</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
