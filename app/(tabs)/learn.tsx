import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Lock,
  CheckCircle2,
  BookOpen,
  Clock,
  CircleDot,
  Circle
} from "lucide-react-native";
import { TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchModules, fetchModuleProgress, Category } from "../../lib/modules";

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
}

const CATEGORY_COLORS: Record<string, string> = {
  FOUNDATION: "#3B82F6",
  TACTICAL: "#F97316",
  OPERATIONS: "#22C55E",
  LEGAL: "#A855F7",
};

const TABS: { label: string; value: Category }[] = [
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
  active: Category;
  onChange: (c: Category) => void;
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
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push(`/lesson?moduleId=${module.id}`);
      }}
      style={[styles.card, styles.cardActive]}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.categoryBadge, { backgroundColor: module.categoryColor + "22" }]}>
          <Text style={[styles.categoryText, { color: module.categoryColor }]}>
            {module.category}
          </Text>
        </View>
        {module.status === "completed" && (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={14} color="white" />
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>
        {module.title}
      </Text>

      <Text style={styles.cardDesc}>
        {module.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={14} color="#9ca3af" style={{ marginRight: 4 }} />
          <Text style={styles.metaText}>
            {module.hours}h {module.minutes}m
          </Text>
        </View>
      </View>

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

      {module.status === "completed" && (
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
  const [activeTab, setActiveTab] = useState<Category>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
      title: m.name,
      description: m.description,
      lessons: m.lessons,
      hours: m.hours,
      minutes: m.minutes,
      progress: prog ? prog.progress_percent : 0,
      status: prog ? prog.status : "not_started",
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
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-[#0D1520]">
      {isFocused && <StatusBar style="light" />}
      <View className="bg-[#0D1520] z-10 border-b border-[#1E2D3D]">
        <View className="px-4 py-4">
          <Text className="text-white text-2xl font-extrabold tracking-wider uppercase">
            MODULES LIBRARY
          </Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color="#6B7280" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search modules..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

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
    </SafeAreaView>
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
    backgroundColor: "#1E2535",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  tabPillInactive: {
    backgroundColor: "transparent",
    borderColor: "#2D3748",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#0F1624",
  },
  tabLabelInactive: {
    color: "#9ca3af",
  },

  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: "#2D3748",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
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
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardActive: {
    backgroundColor: "#131C2E",
    borderColor: "#1E2D45",
  },
  cardLocked: {
    backgroundColor: "#141B2A",
    borderColor: "#2D3748",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  lockIcon: {
    fontSize: 18,
    color: "#6b7280",
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22C55E",
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
    backgroundColor: "#1E2535",
    borderWidth: 1,
    borderColor: "#2D3748",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  upgradeBtnText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
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
    backgroundColor: "#D82C15",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },
  assessmentCardBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});