import React, { useState } from "react";
import { 

  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  FlatList,
  Dimensions
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { 
  Search, 
  Lock, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Zap,
  CircleDot,
  Circle
} from "lucide-react-native";
import { TextInput, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "ALL" | "FOUNDATION" | "TACTICAL" | "OPERATIONS" | "LEGAL";

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  {
    id: "1",
    category: "FOUNDATION",
    categoryColor: "#3B82F6",
    title: "CP Fundamentals",
    description:
      "Core principles, roles, and responsibilities of close protection professionals operating in the modern security landscape.",
    lessons: 5,
    hours: 2,
    minutes: 30,
    progress: 44,
    status: "in_progress",
  },
  {
    id: "2",
    category: "TACTICAL",
    categoryColor: "#F97316",
    title: "Threat Assessment",
    description:
      "Systematic evaluation of threats, vulnerabilities and risk matrices to protect the principal at all times.",
    lessons: 4,
    hours: 1,
    minutes: 55,
    progress: 100,
    status: "completed",
  },
  {
    id: "3",
    category: "OPERATIONS",
    categoryColor: "#22C55E",
    title: "Venue Security",
    description:
      "Planning, advancing, and securing venues — from private residences to public events and international locations.",
    lessons: 5,
    hours: 2,
    minutes: 45,
    progress: 38,
    status: "in_progress",
  },
  {
    id: "4",
    category: "OPERATIONS",
    categoryColor: "#22C55E",
    title: "Advance Work",
    description:
      "Comprehensive advance planning methodologies for CP operatives, residential stays, and high-risk operations.",
    lessons: 4,
    hours: 2,
    minutes: 10,
    progress: 8,
    status: "not_started",
  },
  {
    id: "5",
    category: "LEGAL",
    categoryColor: "#A855F7",
    title: "Legal Framework",
    description:
      "UK and international legal considerations for CP operatives, including use of force, licensing, and liability.",
    lessons: 4,
    hours: 1,
    minutes: 30,
    progress: -1,
    status: "locked",
  },
  {
    id: "6",
    category: "OPERATIONS",
    categoryColor: "#22C55E",
    title: "Specialist Operations",
    description:
      "Advanced techniques for hostile environment operations, maritime security, and VIP escort procedures.",
    lessons: 5,
    hours: 2,
    minutes: 10,
    progress: -1,
    status: "locked",
  },
];

const TABS: { label: string; value: Category }[] = [
  { label: "ALL", value: "ALL" },
  { label: "FOUNDATION", value: "FOUNDATION" },
  { label: "TACTICAL", value: "TACTICAL" },
  { label: "OPERATIONS", value: "OPERATIONS" },
  { label: "LEGAL", value: "LEGAL" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SearchBar = () => (
  <View style={styles.searchBar}>
    <Search size={18} color="#6B7280" style={{ marginRight: 8 }} />
    <TextInput
      style={styles.searchInput}
      placeholder="Search modules..."
      placeholderTextColor="#6B7280"
    />
  </View>
);

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
  const isLocked = module.status === "locked";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (!isLocked) {
          if (module.id === "2") {
            router.push("/threat-assessment-details");
          } else {
            router.push(`/module-details?id=${module.id}`);
          }
        }
      }}
      style={[styles.card, isLocked ? styles.cardLocked : styles.cardActive]}
    >
      {/* Category badge + status icon row */}
      <View style={styles.cardTopRow}>
        <View style={[styles.categoryBadge, { backgroundColor: module.categoryColor + "22" }]}>
          <Text style={[styles.categoryText, { color: module.categoryColor }]}>
            {module.category}
          </Text>
        </View>
        {isLocked && <Lock size={18} color="#6b7280" />}
        {module.status === "completed" && (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={14} color="white" />
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={[styles.cardTitle, isLocked && styles.cardTitleLocked]}>
        {module.title}
      </Text>

      {/* Description */}
      <Text style={[styles.cardDesc, isLocked && styles.cardDescLocked]}>
        {module.description}
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BookOpen size={14} color={isLocked ? "#4B5563" : "#9ca3af"} style={{ marginRight: 4 }} />
          <Text style={[styles.metaText, isLocked && styles.metaTextLocked]}>
            {module.lessons} lessons
          </Text>
        </View>
        <Text style={styles.metaDivider}>·</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={14} color={isLocked ? "#4B5563" : "#9ca3af"} style={{ marginRight: 4 }} />
          <Text style={[styles.metaText, isLocked && styles.metaTextLocked]}>
            {module.hours}h {module.minutes}m
          </Text>
        </View>
      </View>

      {/* Progress / Lock CTA */}
      {isLocked ? (
        <TouchableOpacity style={styles.upgradeBtn}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Lock size={12} color="#D1D5DB" style={{ marginRight: 6 }} />
            <Text style={styles.upgradeBtnText}>Upgrade to unlock</Text>
          </View>
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
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ModulesLibrary() {
  const [activeTab, setActiveTab] = useState<Category>("ALL");

  const filteredModules =
    activeTab === "ALL"
      ? MODULES
      : MODULES.filter((m) => m.category === activeTab);

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>MODULES LIBRARY</Text>
      <SearchBar />
      <FilterTabs active={activeTab} onChange={setActiveTab} />
      <FlatList
        data={filteredModules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ModuleCard module={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
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
    backgroundColor: "#1E2535",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
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
});