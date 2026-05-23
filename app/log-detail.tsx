import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Car,
  Search,
  Compass,
  Calendar,
  Info,
  CheckCircle2,
  Circle
} from "lucide-react-native";

export default function LogDetail() {
  const params = useLocalSearchParams();
  const logData = params.data ? JSON.parse(params.data as string) : null;
  const logType = params.log_type;
  const timestamp = params.timestamp as string;

  if (!logData) return null;

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const getSlugLabel = (slug: string) => {
    const clean = slug.replace("-search", "");
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const renderHeader = () => (
    <View className="bg-[#0D1520] border-b border-[#1E2D3D] px-4 py-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mb-4"
      >
        <ArrowLeft size={20} color="#9ca3af" />
        <Text className="text-gray-400 font-medium ml-2">Back to Logs</Text>
      </TouchableOpacity>
      <View className="flex-row items-center gap-3">
        <View className={`w-12 h-12 rounded-xl items-center justify-center border ${logType === "SCRIM" ? "bg-[#2D1010] border-[#5C2020]" : "bg-[#101A24] border-[#1E2D3D]"
          }`}>
          {logType === "SCRIM" ? (
            <Car size={24} color="#E05252" />
          ) : (
            <Search size={24} color="#5C9ECC" />
          )}
        </View>
        <View>
          <Text className="text-white text-xl font-bold">
            {logType === "SCRIM" ? "Vehicle Log Details" : "Search Details"}
          </Text>
          <View className="flex-row items-center mt-1">
            <Calendar size={12} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1">
              {formatTimestamp(timestamp)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderScrimDetails = () => (
    <View className="p-4">
      <View className="bg-[#141E2B] rounded-2xl p-5 border border-[#1E2D3D] mb-4">
        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          Vehicle Information
        </Text>

        <View className="flex-row items-center justify-between mb-6 bg-[#0D1520] p-4 rounded-xl border border-[#1E2D3D]">
          <View>
            <Text className="text-white text-lg font-bold">{logData.make_model}</Text>
            <Text className="text-gray-400">{logData.colour} • {logData.shape}</Text>
          </View>
          <View className="bg-[#F5B041] px-4 py-2 rounded-lg border border-[#D35400]">
            <Text className="text-black font-black tracking-widest text-base uppercase">
              {logData.registration}
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              Identifying Features
            </Text>
            <Text className="text-gray-200 text-sm leading-6">
              {logData.identifying_features}
            </Text>
          </View>

          {logData.direction_of_travel && (
            <View className="pt-4 border-t border-[#1E2D3D]">
              <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                Direction of Travel
              </Text>
              <View className="flex-row items-center gap-2">
                <Compass size={16} color="#9ca3af" />
                <Text className="text-gray-200 text-sm">{logData.direction_of_travel}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderSearchDetails = () => (
    <View className="p-4">
      <View className="bg-[#141E2B] rounded-2xl p-5 border border-[#1E2D3D] mb-4">
        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
          Operation Name
        </Text>
        <Text className="text-white text-xl font-bold mb-4">{logData.operation_name}</Text>

        {logData.overall_notes && (
          <View className="bg-[#0D1520] p-4 rounded-xl border border-[#1E2D3D] mb-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              Notes
            </Text>
            <Text className="text-gray-300 italic text-sm">"{logData.overall_notes}"</Text>
          </View>
        )}
      </View>

      <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-1">
        Completed Sweeps
      </Text>

      {logData.search_logs?.map((log: any, idx: number) => (
        <View key={idx} className="bg-[#141E2B] rounded-2xl p-5 border border-[#1E2D3D] mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-[#5C9ECC]" />
              <Text className="text-white font-bold text-base">
                {getSlugLabel(log.template_slug)} Search
              </Text>
            </View>
          </View>

          <View className="space-y-3">
            {Object.entries(log.answers).map(([key, value]: [string, any], qIdx: number) => (
              <View key={qIdx} className="flex-row items-start gap-3 py-1">
                {value ? (
                  <CheckCircle2 size={18} color="#4ADE80" />
                ) : (
                  <Circle size={18} color="#374151" />
                )}
                <Text className={`${value ? "text-gray-200" : "text-gray-500"} text-sm flex-1`}>
                  {key.split('_').slice(1).join(' ').charAt(0).toUpperCase() + key.split('_').slice(1).join(' ').slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {logType === "SCRIM" ? renderScrimDetails() : renderSearchDetails()}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}