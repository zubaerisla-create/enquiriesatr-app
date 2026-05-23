import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import {
  Car,
  Search,
  Compass,
  FileClock,
  ArrowLeft
} from "lucide-react-native";
import { api } from "../../../lib/api";
import { AnimatedPage } from "../../../components/ui";

interface ScrimData {
  id: number;
  shape: string;
  colour: string;
  registration: string;
  identifying_features: string;
  make_model: string;
  direction_of_travel: string;
}

interface SearchLogItem {
  id: number;
  template_slug: string;
  answers: Record<string, boolean>;
}

interface SearchData {
  id: number;
  operation_name: string;
  overall_notes: string;
  search_logs: SearchLogItem[];
}

interface LogEntry {
  log_type: "SCRIM" | "SEARCH";
  timestamp: string;
  data: ScrimData & SearchData;
}

export default function ToolsLog() {
  const isFocused = useIsFocused();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get<LogEntry[]>("/operative-tools/tools-log/", { requireAuth: true });
      setLogs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchLogs();
    }
  }, [isFocused, fetchLogs]);

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
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

  const renderScrimCard = (item: LogEntry) => {
    const data = item.data as ScrimData;
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/log-detail",
          params: {
            log_type: item.log_type,
            timestamp: item.timestamp,
            data: JSON.stringify(data)
          }
        })}
        activeOpacity={0.7}
        className="mx-4 mb-4 bg-[#141E2B] rounded-2xl p-4 border border-[#1E2D3D]"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-lg bg-[#2D1010] items-center justify-center border border-[#5C2020]">
              <Car size={16} color="#E05252" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm uppercase tracking-wide">
                Suspicious Vehicle (SCRIM)
              </Text>
              <Text className="text-gray-500 text-[10px] font-medium">
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3 bg-[#0D1520] p-3 rounded-xl border border-[#1E2D3D]">
          <View className="flex-1">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              Vehicle
            </Text>
            <Text className="text-white text-sm font-semibold">
              {data.colour} {data.make_model}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Shape: {data.shape}
            </Text>
          </View>
          <View className="bg-[#F5B041] border border-[#D35400] px-3 py-1 rounded-lg items-center justify-center">
            <Text className="text-black font-extrabold tracking-widest text-xs uppercase">
              {data.registration}
            </Text>
          </View>
        </View>

        <View className="space-y-2">
          <View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              Identifying Features
            </Text>
            <Text className="text-gray-300 text-xs leading-relaxed mt-0.5" numberOfLines={2}>
              {data.identifying_features}
            </Text>
          </View>
          {data.direction_of_travel ? (
            <View className="mt-2 pt-2 border-t border-[#1E2D3D] flex-row items-center gap-1.5">
              <Compass size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs">
                Direction: <Text className="text-gray-300 font-medium">{data.direction_of_travel}</Text>
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchCard = (item: LogEntry) => {
    const data = item.data as SearchData;
    const uniqueSweeps = Array.from(
      new Set((data.search_logs || []).map((log) => getSlugLabel(log.template_slug)))
    );

    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/log-detail",
          params: {
            log_type: item.log_type,
            timestamp: item.timestamp,
            data: JSON.stringify(data)
          }
        })}
        activeOpacity={0.7}
        className="mx-4 mb-4 bg-[#141E2B] rounded-2xl p-4 border border-[#1E2D3D]"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-lg bg-[#101A24] items-center justify-center border border-[#1E2D3D]">
              <Search size={16} color="#5C9ECC" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm uppercase tracking-wide">
                Search Operation
              </Text>
              <Text className="text-gray-500 text-[10px] font-medium">
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-white font-bold text-base">
            {data.operation_name}
          </Text>
        </View>

        {uniqueSweeps.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 mb-3">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mr-1 mt-1">
              Sweeps:
            </Text>
            {uniqueSweeps.map((sweep, index) => (
              <View key={index} className="bg-[#1E2D45] px-2 py-0.5 rounded-md border border-[#2D3F58]">
                <Text className="text-gray-300 text-[10px] font-semibold">
                  {sweep}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.overall_notes ? (
          <View className="mt-2 pt-2 border-t border-[#1E2D3D] bg-[#0D1520] p-3 rounded-xl border border-[#1E2D3D]">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              Overall Notes
            </Text>
            <Text className="text-gray-400 text-xs italic leading-relaxed" numberOfLines={2}>
              "{data.overall_notes}"
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: LogEntry }) => {
    if (item.log_type === "SCRIM") {
      return renderScrimCard(item);
    }
    if (item.log_type === "SEARCH") {
      return renderSearchCard(item);
    }
    return null;
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0D1520]">
      {isFocused && <StatusBar style="light" />}

      <AnimatedPage>
        <View className="bg-[#0D1520] z-10 border-b border-[#1E2D3D]">
          <View className="px-4 py-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-4"
            >
              <ArrowLeft size={18} color="#9ca3af" />
              <Text className="text-gray-400 font-medium ml-2 text-sm">Profile</Text>
            </TouchableOpacity>

            <Text className="text-white text-2xl font-extrabold tracking-wider uppercase">
              Tools Log
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Chronological tactical activity feed
            </Text>
          </View>
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#D82C15" />
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.log_type + "-" + item.data.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchLogs(true)}
                tintColor="#D82C15"
              />
            }
            ListEmptyComponent={
              <View className="py-20 items-center justify-center">
                <FileClock size={48} color="#1F2937" />
                <Text className="text-gray-500 mt-4 font-medium">No activity logged yet</Text>
              </View>
            }
          />
        )}
      </AnimatedPage>
    </SafeAreaView>
  );
}
