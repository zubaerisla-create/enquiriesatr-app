import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import TabScreenWrapper from "../../components/ui/TabScreenWrapper";

import {
  LucideIcon,
  Search,
  ClipboardList,
  MapPin,
  Home,
  Plane,
  ShieldCheck,
  FileText,
  ChevronRight
} from "lucide-react-native";
import { api } from "../../lib/api";

type TagColor = "operations" | "planning" | "tactical";

interface Tool {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  title: string;
  tag: string;
  tagColor: TagColor;
  description: string;
  route: string;
}

interface SavedDoc {
  id: string;
  apiId: number;
  apiType: string;
  title: string;
  type: string;
  date: string;
}

interface ApiDoc {
  id: number;
  type: string;
  title: string;
  risk_level: string;
  created_at: string;
}

const TOOLS: Tool[] = [
  {
    id: "1",
    icon: Search,
    iconBg: "#1E1214",
    title: "Search\nOperations",
    tag: "OPERATIONS",
    tagColor: "operations",
    description:
      "Systematic search procedures for venues, vehicles, persons, and items.",
    route: "/search-operations",
  },
  {
    id: "2",
    icon: ClipboardList,
    iconBg: "#1A1420",
    title: "Venue\nSecurity",
    tag: "OPERATIONS",
    tagColor: "operations",
    description: "Advance work and security protocols for any venue type.",
    route: "/venue-security-rag",
  },
  {
    id: "3",
    icon: ShieldCheck,
    iconBg: "#141A1E",
    title: "Threat\nAssessment",
    tag: "PLANNING",
    tagColor: "planning",
    description: "AI-powered threat assessment and risk reporting tool.",
    route: "/threat-assessment-checklist",
  },
  {
    id: "4",
    icon: MapPin,
    iconBg: "#181C14",
    title: "Advance Work",
    tag: "PLANNING",
    tagColor: "planning",
    description:
      "Route planning, hospital advances, and location recce templates.",
    route: "/route-recce",
  },
  {
    id: "5",
    icon: Home,
    iconBg: "#1E1214",
    title: "Residential\nSecurity",
    tag: "OPERATIONS",
    tagColor: "operations",
    description:
      "Home and close protection procedures for residential assignments.",
    route: "/residential-security-checklist",
  },
  {
    id: "6",
    icon: Plane,
    iconBg: "#181C14",
    title: "Travel\nSecurity",
    tag: "PLANNING",
    tagColor: "planning",
    description: "International travel security planning and documentation.",
    route: "/travel-security-scrim",
  },
  // {
  //   id: "7",
  //   icon: ShieldCheck,
  //   iconBg: "#141A1E",
  //   title: "Escort\nProcedures",
  //   tag: "TACTICAL",
  //   tagColor: "tactical",
  //   description:
  //     "Foot and vehicle escort drills, formations, and protocols.",
  //   route: "/search-operations",
  // },
];

const tagStyle = (color: TagColor) => {
  switch (color) {
    case "operations":
      return { bg: "#2D1010", text: "#E05252" };
    case "planning":
      return { bg: "#1A2410", text: "#7CB87C" };
    case "tactical":
      return { bg: "#101A24", text: "#5C9ECC" };
  }
};

const ToolCard = ({ tool }: { tool: Tool }) => {
  const tag = tagStyle(tool.tagColor);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.navigate(tool.route as any)}
      className="mx-4 mb-4 bg-[#141E2B] rounded-2xl p-4 flex-row items-center gap-4"
    >
      <View
        style={{ backgroundColor: tool.iconBg }}
        className="w-12 h-12 rounded-xl items-center justify-center border border-[#2A2A3A]"
      >
        <tool.icon size={20} color={tag.text} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5 flex-wrap">
          <Text className="text-white font-bold text-base leading-tight">
            {tool.title}
          </Text>
          <View
            style={{ backgroundColor: tag.bg }}
            className="px-2 py-0.5 rounded"
          >
            <Text
              style={{ color: tag.text }}
              className="text-[10px] font-bold tracking-widest"
            >
              {tool.tag}
            </Text>
          </View>
        </View>
        <Text className="text-gray-400 text-xs leading-5 mt-1">
          {tool.description}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.navigate(tool.route as any)}
        className="bg-[#C0392B] rounded-xl px-4 py-2.5 ml-1"
      >
        <Text className="text-white font-semibold text-sm">Start</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const SavedDocRow = ({ doc }: { doc: SavedDoc }) => (
  <TouchableOpacity
    onPress={() => router.push({
      pathname: "/document-details",
      params: { id: doc.apiId, type: doc.apiType, title: doc.title }
    })}
    className="mx-4 mb-3 bg-[#141E2B] rounded-2xl px-4 py-4 flex-row items-center gap-3"
  >
    <View className="w-9 h-9 rounded-lg bg-[#1E2D45] items-center justify-center">
      <FileText size={18} color="#9ca3af" />
    </View>

    <View className="flex-1">
      <Text className="text-white text-sm font-semibold" numberOfLines={1}>{doc.title}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">
        {doc.type} · {doc.date}
      </Text>
    </View>

    <ChevronRight size={18} color="#4B5563" />
  </TouchableOpacity>
);

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export default function Tools() {
  const isFocused = useIsFocused();
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    try {
      const response = await api.get<ApiDoc[]>("/users/document/list/", { requireAuth: true });
      const mapped = response.data
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((d) => ({
          id: `${d.type}-${d.id}`,
          apiId: d.id,
          apiType: d.type,
          title: d.title,
          type: d.type === "THREAT_ASSESSMENT"
            ? "Threat Assessment"
            : d.type === "VENUE_REPORT"
              ? "Venue Assessment"
              : d.type === "SEARCH_REPORT"
                ? "Search Operations"
                : d.type === "RESIDENTIAL_REPORT"
                  ? "Residential Handover"
                  : d.type === "ROUTE_RECCE_REPORT"
                    ? "Route Recce Briefing"
                    : d.type,
          date: formatDate(d.created_at)
        }));
      setSavedDocs(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchDocs();
    }
  }, [isFocused, fetchDocs]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0D1520]">
      {isFocused && <StatusBar style="light" />}
      <TabScreenWrapper>

        <View className="bg-[#0D1520] z-10 border-b border-[#1E2D3D]">
          <View className="px-4 py-4">
            <Text className="text-white text-2xl font-extrabold tracking-wider uppercase">
              Operational Tools
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Procedures and templates for the field
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        >
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}

          <View className="px-4 mt-8 mb-3 flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">
              My Saved Documents
            </Text>
            <TouchableOpacity onPress={() => router.push("/profile/my-documents")}>
              <Text className="text-[#C0392B] text-xs font-bold uppercase tracking-wider">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {docsLoading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#C0392B" />
            </View>
          ) : savedDocs.length > 0 ? (
            savedDocs.map((doc) => (
              <SavedDocRow key={doc.id} doc={doc} />
            ))
          ) : (
            <View className="mx-4 bg-[#141E2B] rounded-2xl px-4 py-6 items-center justify-center">
              <Text className="text-gray-500 text-xs">No recent documents</Text>
            </View>
          )}
        </ScrollView>
      </TabScreenWrapper>

    </SafeAreaView>
  );
}