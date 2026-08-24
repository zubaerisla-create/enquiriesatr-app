import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Lock,
  Search
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabScreenWrapper from "../../components/ui/TabScreenWrapper";
import { useAuth } from "../../hooks/useAuth";
import { Category, fetchModuleProgress, fetchModules } from "../../lib/modules";

interface Module {
  id: string;
  category: Category;
  categoryColor: string;
  title: string;
  description: string;
  lessons: number;
  hours: number;
  minutes: number;
  progress: number;
  status: "in_progress" | "completed" | "not_started" | "locked";
  is_free?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  FOUNDATION: "#3B82F6",
  TACTICAL: "#F97316",
  OPERATIONS: "#22C55E",
  LEGAL: "#A855F7",
};

const TABS: { label: string; value: Category | "ALL" }[] = [
  { label: "ALL", value: "ALL" },
  { label: "FOUNDATION", value: "FOUNDATION" },
  { label: "TACTICAL", value: "TACTICAL" },
  { label: "OPERATIONS", value: "OPERATIONS" },
  { label: "LEGAL", value: "LEGAL" },
];

const FilterTabs = ({
  active,
  onChange,
}: {
  active: Category | "ALL";
  onChange: (c: Category | "ALL") => void;
}) => {
  const screenWidth = Dimensions.get("window").width;
  const tabMinWidth = screenWidth < 380 ? 75 : 82;

  return (
    <View style={styles.tabsWrapper}>
      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        renderItem={({ item: tab }) => {
          const isActive = active === tab.value;
          return (
            <TouchableOpacity
              onPress={() => onChange(tab.value)}
              activeOpacity={0.85}
              style={[
                styles.tabPill,
                { minWidth: tabMinWidth },
                isActive ? styles.tabPillActive : styles.tabPillInactive,
              ]}
            >
              <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const StatusBadge = ({ status }: { status: Module["status"] }) => {
  if (status === "completed")
    return (
      <View style={styles.badgeRow}>
        <CheckCircle2 size={12} color="#4ade80" style={{ marginRight: 4 }} />
        <Text style={[styles.badgeText, { color: "#4ade80" }]}>Completed</Text>
      </View>
    );
  if (status === "in_progress")
    return (
      <View style={styles.badgeRow}>
        <CircleDot size={12} color="#60a5fa" style={{ marginRight: 4 }} />
        <Text style={[styles.badgeText, { color: "#60a5fa" }]}>In progress</Text>
      </View>
    );
  if (status === "not_started")
    return (
      <View style={styles.badgeRow}>
        <Circle size={12} color="#6b7280" style={{ marginRight: 4 }} />
        <Text style={[styles.badgeText, { color: "#9ca3af" }]}>Not started</Text>
      </View>
    );
  return null;
};

const ModuleCard = ({ module }: { module: Module }) => {
  const { user } = useAuth();
  const hasActiveSub = user?.has_active_sub || false;
  const isLocked = !module.is_free && !hasActiveSub;

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1.0 : 0.8}
      onPress={() => {
        if (!isLocked) {
          router.push(`/lesson?moduleId=${module.id}`);
        }
      }}
      style={[styles.card, isLocked ? styles.cardLocked : styles.cardActive]}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.categoryBadge, { backgroundColor: module.categoryColor + "15", borderColor: module.categoryColor + "50" }]}>
          <Text style={[styles.categoryText, { color: module.categoryColor }]}>
            {module.category}
          </Text>
        </View>
        {isLocked ? (
          <Lock size={16} color="#6b7280" />
        ) : (
          module.status === "completed" && (
            <View style={styles.completedBadge}>
              <CheckCircle2 size={14} color="#4ADE80" />
            </View>
          )
        )}
      </View>

      <Text style={[styles.cardTitle, isLocked && styles.cardTitleLocked]}>
        {module.title}
      </Text>

      <Text style={[styles.cardDesc, isLocked && styles.cardDescLocked]}>
        {module.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={14} color={isLocked ? "#4B5563" : "#9ca3af"} style={{ marginRight: 4 }} />
          <Text style={[styles.metaText, isLocked && styles.metaTextLocked]}>
            {module.hours}h {module.minutes}m
          </Text>
        </View>
      </View>

      {isLocked ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.push("/profile/subscription-billing");
          }}
          style={styles.upgradeBtn}
        >
          <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <ProgressBar
            progress={module.progress}
            color={module.status === "completed" ? "#22C55E" : module.categoryColor}
          />
          <View style={styles.progressFooter}>
            <StatusBadge status={module.status} />
            <Text style={styles.progressPercent}>{module.progress}%</Text>
          </View>
        </View>
      )}

      {!isLocked && module.status === "completed" && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.push(`/assessment/intro?moduleId=${module.id}`);
          }}
          style={styles.assessmentCardBtn}
        >
          <Text style={styles.assessmentCardBtnText}>Take Assessment</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function ModulesLibrary() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Category | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: modulesList, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });

  const { data: progressData } = useQuery({
    queryKey: ["modules-progress"],
    queryFn: fetchModuleProgress,
  });

  const mappedModules: Module[] = (modulesList || []).map((m) => {
    const prog = (progressData || []).find((p) => p.module === m.module_id);
    return {
      id: String(m.module_id),
      category: m.category,
      categoryColor: CATEGORY_COLORS[m.category] || "#3B82F6",
      title: `S${(m.order ?? 0) + 1}. ${m.name}`,
      description: m.description,
      lessons: m.lessons || 0,
      hours: m.hours || 0,
      minutes: m.minutes || 0,
      progress: prog ? prog.progress_percent : 0,
      status: prog ? prog.status : "not_started",
      is_free: m.is_free,
    };
  });

  const filteredModules = mappedModules.filter((m) => {
    const matchesCategory = activeTab === "ALL" || m.category === activeTab;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View className="flex-1 bg-[#0D1520]" style={{ backgroundColor: '#0D1520', paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
      {isFocused && <StatusBar style="light" />}
      <TabScreenWrapper>
        <View className="bg-[#0D1520] z-10 border-b border-[#1E2D3D] pb-2 mb-4">
          <View className="px-5 py-2 pt-6 flex-row items-center justify-between">
            <Text className="text-slate-100 text-[28px] font-black tracking-widest uppercase shadow-sm">
              MODULES LIBRARY
            </Text>
            <TouchableOpacity onPress={() => setShowSearch(!showSearch)} className="p-2 -mr-2">
              <Search size={24} color={showSearch ? "#D82C15" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchBar}>
            <Search size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search modules..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        <FilterTabs active={activeTab} onChange={setActiveTab} />

        {modulesLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={filteredModules}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ModuleCard module={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </TabScreenWrapper>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingTop: 56,
  },
  screenTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2436",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#D1D5DB",
    fontSize: 14,
  },

  // Filter Tabs
  tabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#D82C15",
    borderColor: "#D82C15",
    shadowColor: "#D82C15",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  tabPillInactive: {
    backgroundColor: "#161F2E",
    borderColor: "#2D3748",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#ffffff",
  },
  tabLabelInactive: {
    color: "#9ca3af",
  },

  // Progress bar
  progressTrack: {
    height: 6,
    backgroundColor: "#1E2D3D",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Status badge
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
  },

  // Module Card
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  cardActive: {
    backgroundColor: "#1A2436",
    borderColor: "#374151",
  },
  cardLocked: {
    backgroundColor: "#111827",
    borderColor: "#1F2937",
    opacity: 0.95,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  lockIcon: {
    fontSize: 18,
    color: "#6b7280",
  },
  completedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  completedCheck: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardTitleLocked: {
    color: "#6b7280",
  },
  cardDesc: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardDescLocked: {
    color: "#4B5563",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  metaText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  metaTextLocked: {
    color: "#4B5563",
  },
  metaDivider: {
    color: "#4B5563",
  },
  upgradeBtn: {
    backgroundColor: "rgba(216, 44, 21, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(216, 44, 21, 0.3)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  upgradeBtnText: {
    color: "#D82C15",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  progressFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressPercent: {
    color: "#6b7280",
    fontSize: 12,
  },
  assessmentCardBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  assessmentCardBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});