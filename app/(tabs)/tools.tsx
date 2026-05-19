import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

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

// ─── Types ────────────────────────────────────────────────────────────────────

type TagColor = "operations" | "planning" | "tactical";

interface Tool {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  title: string;
  tag: string;
  tagColor: TagColor;
  description: string;
}

interface SavedDoc {
  id: string;
  title: string;
  type: string;
  date: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  },
  {
    id: "2",
    icon: ClipboardList,
    iconBg: "#1A1420",
    title: "Venue\nSecurity",
    tag: "OPERATIONS",
    tagColor: "operations",
    description: "Advance work and security protocols for any venue type.",
  },
  {
    id: "3",
    icon: MapPin,
    iconBg: "#181C14",
    title: "Advance Work",
    tag: "PLANNING",
    tagColor: "planning",
    description:
      "Route planning, hospital advances, and location recce templates.",
  },
  {
    id: "4",
    icon: Home,
    iconBg: "#1E1214",
    title: "Residential\nSecurity",
    tag: "OPERATIONS",
    tagColor: "operations",
    description:
      "Home and close protection procedures for residential assignments.",
  },
  {
    id: "5",
    icon: Plane,
    iconBg: "#181C14",
    title: "Travel\nSecurity",
    tag: "PLANNING",
    tagColor: "planning",
    description: "International travel security planning and documentation.",
  },
  {
    id: "6",
    icon: ShieldCheck,
    iconBg: "#141A1E",
    title: "Escort\nProcedures",
    tag: "TACTICAL",
    tagColor: "tactical",
    description:
      "Foot and vehicle escort drills, formations, and protocols.",
  },
];

const SAVED_DOCS: SavedDoc[] = [
  {
    id: "1",
    title: "Premises Search — Knightsbridge",
    type: "Checklist",
    date: "22 Mar 2026",
  },
  {
    id: "2",
    title: "Risk Assessment — Venue Advance",
    type: "Document",
    date: "28 Mar 2026",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Tool Card ────────────────────────────────────────────────────────────────

const ToolCard = ({ tool }: { tool: Tool }) => {
  const tag = tagStyle(tool.tagColor);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.navigate("/tool-details")}
      className="mx-4 mb-4 bg-[#141E2B] rounded-2xl p-4 flex-row items-center gap-4"
    >
      {/* Icon box */}
      <View
        style={{ backgroundColor: tool.iconBg }}
        className="w-12 h-12 rounded-xl items-center justify-center border border-[#2A2A3A]"
      >
        <tool.icon size={20} color={tag.text} />
      </View>

      {/* Content */}
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

      {/* Start button */}
      <TouchableOpacity
        onPress={() => router.navigate("/tool-details")}
        className="bg-[#C0392B] rounded-xl px-4 py-2.5 ml-1"
      >
        <Text className="text-white font-semibold text-sm">Start</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── Saved Document Row ───────────────────────────────────────────────────────

const SavedDocRow = ({ doc }: { doc: SavedDoc }) => (
  <TouchableOpacity className="mx-4 mb-3 bg-[#141E2B] rounded-2xl px-4 py-4 flex-row items-center gap-3">
    <View className="w-9 h-9 rounded-lg bg-[#1E2D45] items-center justify-center">
      <FileText size={18} color="#9ca3af" />
    </View>

    <View className="flex-1">
      <Text className="text-white text-sm font-semibold">{doc.title}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">
        {doc.type} · {doc.date}
      </Text>
    </View>

    <ChevronRight size={18} color="#4B5563" />
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Tools() {
  const isFocused = useIsFocused();
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0D1520]">
      {isFocused && <StatusBar style="light" />}

      {/* Sticky Page Header */}
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

      {/* Scrollable Content - Cards are now lower */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        {/* Tool cards - increased top spacing */}
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}

        {/* Saved documents section */}
        <View className="px-4 mt-8 mb-3">
          <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">
            My Saved Documents
          </Text>
        </View>

        {SAVED_DOCS.map((doc) => (
          <SavedDocRow key={doc.id} doc={doc} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}