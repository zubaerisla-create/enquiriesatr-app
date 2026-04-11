import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { 
  LucideIcon, 
  Search, 
  FileText, 
  ClipboardList, 
  CheckCircle, 
  Download, 
  Trash2 
} from "lucide-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "complete" | "draft";
type DocColor = "red" | "orange" | "green" | "yellow";

interface Doc {
  id: string;
  icon: LucideIcon;
  iconColor: DocColor;
  title: string;
  type: string;
  date: string;
  status: DocStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DOCUMENTS: Doc[] = [
  {
    id: "1",
    icon: ClipboardList,
    iconColor: "red",
    title: "Premises Search — Knightsbridge",
    type: "Checklist",
    date: "22 Mar 2026",
    status: "complete",
  },
  {
    id: "2",
    icon: FileText,
    iconColor: "orange",
    title: "Risk Assessment — Venue Advance",
    type: "Risk Assessment",
    date: "20 Mar 2026",
    status: "complete",
  },
  {
    id: "3",
    icon: CheckCircle,
    iconColor: "green",
    title: "Travel Security Plan — Dubai",
    type: "Report",
    date: "18 Mar 2026",
    status: "complete",
  },
  {
    id: "4",
    icon: FileText,
    iconColor: "yellow",
    title: "Residential Security Br",
    type: "Risk Assessment",
    date: "15 Mar 2026",
    status: "draft",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const iconStyles: Record<DocColor, { bg: string; border: string; text: string }> = {
  red:    { bg: "#2D1010", border: "#5C2020", text: "#E05252" },
  orange: { bg: "#2D1C0A", border: "#5C3A14", text: "#F5A623" },
  green:  { bg: "#0D2318", border: "#1A4030", text: "#4CAF82" },
  yellow: { bg: "#2D2510", border: "#5C4A20", text: "#D4A843" },
};

// ─── Stats Card ───────────────────────────────────────────────────────────────

const StatCard = ({
  value,
  label,
  valueColor,
  bordered,
}: {
  value: string;
  label: string;
  valueColor: string;
  bordered?: boolean;
}) => (
  <View
    className={`flex-1 bg-[#141E2B] rounded-2xl py-4 items-center justify-center ${
      bordered ? "border border-[#2A3D52]" : ""
    }`}
  >
    <Text style={{ color: valueColor }} className="text-3xl font-extrabold leading-tight">
      {value}
    </Text>
    <Text className="text-gray-500 text-[10px] font-bold tracking-widest mt-1 uppercase">
      {label}
    </Text>
  </View>
);

// ─── Document Row ─────────────────────────────────────────────────────────────

const DocRow = ({ doc }: { doc: Doc }) => {
  const style = iconStyles[doc.iconColor];

  return (
    <View className="mx-4 mb-3 bg-[#141E2B] rounded-2xl px-4 py-4 flex-row items-center gap-3">
      {/* Icon */}
      <View
        style={{ backgroundColor: style.bg, borderColor: style.border }}
        className="w-11 h-11 rounded-xl items-center justify-center border"
      >
        <doc.icon size={18} color={style.text} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text
            className="text-white font-semibold text-sm"
            numberOfLines={1}
          >
            {doc.title}
          </Text>
          {doc.status === "draft" && (
            <View className="bg-[#2D2510] border border-[#D4A843] rounded px-1.5 py-0.5">
              <Text className="text-[#D4A843] text-[9px] font-bold tracking-widest">
                DRAFT
              </Text>
            </View>
          )}
        </View>
        <Text className="text-gray-500 text-xs mt-0.5">
          {doc.type} · {doc.date}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity>
          <Download size={18} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Trash2 size={18} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyDocuments() {
  const [search, setSearch] = useState("");

  const total = DOCUMENTS.length;
  const complete = DOCUMENTS.filter((d) => d.status === "complete").length;
  const drafts = DOCUMENTS.filter((d) => d.status === "draft").length;

  const filtered = DOCUMENTS.filter(
    (d) =>
      search.trim() === "" ||
      d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >


        {/* Search bar */}
        <View className="mx-4 mb-5 flex-row items-center bg-[#141E2B] rounded-xl px-4 py-3 gap-2">
          <Search size={18} color="#4B5563" />
          <TextInput
            className="flex-1 text-gray-300 text-sm"
            placeholder="Search documents..."
            placeholderTextColor="#4B5563"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Stats row */}
        <View className="flex-row mx-4 gap-3 mb-5">
          <StatCard value={String(total)}    label="Total"    valueColor="#E05252" />
          <StatCard value={String(complete)} label="Complete" valueColor="#4CAF82" bordered />
          <StatCard value={String(drafts)}   label="Drafts"   valueColor="#D4A843" />
        </View>

        {/* Document list */}
        {filtered.map((doc) => (
          <DocRow key={doc.id} doc={doc} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}