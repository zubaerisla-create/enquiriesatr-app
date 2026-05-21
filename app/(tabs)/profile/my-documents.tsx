import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  LucideIcon,
  Search,
  FileText,
  CheckCircle,
  Download,
  Trash2,
  AlertTriangle,
  FileQuestion
} from "lucide-react-native";
import { router } from "expo-router";
import { api } from "../../../lib/api";
import { exportReportToPDF } from "../../../utils/pdf-export";
import AlertModal from "../../../components/ui/AlertModal";

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
  apiType: string;
  apiId: number;
}

interface ApiDoc {
  id: number;
  type: string;
  title: string;
  risk_level: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const iconStyles: Record<DocColor, { bg: string; border: string; text: string }> = {
  red: { bg: "#2D1010", border: "#5C2020", text: "#E05252" },
  orange: { bg: "#2D1C0A", border: "#5C3A14", text: "#F5A623" },
  green: { bg: "#0D2318", border: "#1A4030", text: "#4CAF82" },
  yellow: { bg: "#2D2510", border: "#5C4A20", text: "#D4A843" },
};

const getRiskInfo = (riskLevel: string): { icon: LucideIcon; color: DocColor } => {
  const level = riskLevel?.toLowerCase() || "";
  if (level.includes("high") || level.includes("critical")) return { icon: AlertTriangle, color: "red" };
  if (level.includes("medium")) return { icon: FileText, color: "orange" };
  if (level.includes("low")) return { icon: CheckCircle, color: "green" };
  return { icon: FileQuestion, color: "yellow" };
};

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
    className={`flex-1 bg-[#141E2B] rounded-2xl py-4 items-center justify-center ${bordered ? "border border-[#2A3D52]" : ""
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

const DocRow = ({
  doc,
  onPress,
  onDownload,
  onDelete,
  isDownloading
}: {
  doc: Doc;
  onPress: (doc: Doc) => void;
  onDownload: (doc: Doc) => void;
  onDelete: (doc: Doc) => void;
  isDownloading: boolean;
}) => {
  const style = iconStyles[doc.iconColor];
  const IconComponent = doc.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(doc)}
      className="mx-4 mb-3 bg-[#141E2B] rounded-2xl px-4 py-4 flex-row items-center gap-3"
    >
      <View
        style={{ backgroundColor: style.bg, borderColor: style.border }}
        className="w-11 h-11 rounded-xl items-center justify-center border"
      >
        <IconComponent size={18} color={style.text} />
      </View>

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

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => onDownload(doc)}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size={18} color="#4B5563" />
          ) : (
            <Download size={18} color="#4B5563" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(doc)}>
          <Trash2 size={18} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyDocuments() {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get<ApiDoc[]>("/users/document/list/", { requireAuth: true });
      const mappedDocs: Doc[] = response.data.map((d) => {
        const { icon, color } = getRiskInfo(d.risk_level);
        return {
          id: `${d.type}-${d.id}`,
          apiId: d.id,
          apiType: d.type,
          icon,
          iconColor: color,
          title: d.title,
          type: d.type === "THREAT_ASSESSMENT" ? "Threat Assessment" : d.type === "VENUE_REPORT" ? "Venue Assessment" : d.type === "SEARCH_REPORT" ? "Search Operations" : d.type,
          date: formatDate(d.created_at),
          status: "complete", // Backend only returns generated reports currently
        };
      });
      setDocuments(mappedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handlePress = (doc: Doc) => {
    router.push({
      pathname: "/document-details",
      params: { id: doc.apiId, type: doc.apiType, title: doc.title }
    });
  };

  const handleDownload = async (doc: Doc) => {
    setDownloadingId(doc.id);
    try {
      const response = await api.get("/users/document/details/", {
        params: { type: doc.apiType, id: doc.apiId },
        requireAuth: true,
      });
      await exportReportToPDF(response.data);
    } catch (error) {
      console.error("Error downloading document:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeletePress = (doc: Doc) => {
    setSelectedDoc(doc);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await api.delete("/users/document/delete/", {
        params: { type: selectedDoc.apiType, id: selectedDoc.apiId },
        requireAuth: true,
      });
      setDocuments((prev) => prev.filter((d) => d.id !== selectedDoc.id));
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setDeleting(false);
      setSelectedDoc(null);
    }
  };

  const total = documents.length;
  const complete = documents.filter((d) => d.status === "complete").length;
  const drafts = documents.filter((d) => d.status === "draft").length;

  const filtered = documents.filter(
    (d) =>
      search.trim() === "" ||
      d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchDocuments(true)} tintColor="#E05252" />
        }
      >
        {/* Search bar */}
        <View className="mx-4 mb-5 flex-row items-center bg-[#141E2B] rounded-xl px-4 py-3 mt-4 gap-2">
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
          <StatCard value={String(total)} label="Total" valueColor="#E05252" />
          <StatCard value={String(complete)} label="Complete" valueColor="#4CAF82" bordered />
          <StatCard value={String(drafts)} label="Drafts" valueColor="#D4A843" />
        </View>

        {/* Document list */}
        {loading && !refreshing ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#E05252" />
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              onPress={handlePress}
              onDownload={handleDownload}
              onDelete={handleDeletePress}
              isDownloading={downloadingId === doc.id}
            />
          ))
        ) : (
          <View className="py-20 items-center justify-center">
            <FileText size={48} color="#1F2937" />
            <Text className="text-gray-500 mt-4 font-medium">No documents found</Text>
          </View>
        )}
      </ScrollView>

      <AlertModal
        visible={deleteModalVisible}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </View>
  );
}
