import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Users,
  Activity,
  Camera,
  AlertCircle,
  Grid,
  FileText,
  ChevronUp,
  ChevronDown,
  Check,
  Crosshair,
  Eye,
  ShieldAlert
} from "lucide-react-native";
import { api } from "../lib/api";
import AlertModal from "../components/ui/AlertModal";

// Simple debounce implementation to avoid dependency on lodash
function debounce(func: Function, wait: number) {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const ICON_MAP = {
  shield: Shield,
  "alert-triangle": AlertTriangle,
  users: Users,
  activity: Activity,
  camera: Camera,
  "alert-circle": AlertCircle,
  grid: Grid,
  "file-text": FileText,
  crosshair: Crosshair,
  eye: Eye,
  "shield-off": ShieldAlert
};

// ─── Data ────────────────────────────────────────────────────────────────────

const SEVERITY_OPTS = ["Low", "Medium", "High", "Critical"];

interface Category {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  items: { key: string; label: string }[];
}

const CATEGORY_COLORS = [
  { iconColor: "#4A90D9", iconBg: "#1E2D45" },
  { iconColor: "#F5A623", iconBg: "#2A2010" },
  { iconColor: "#A855F7", iconBg: "#1E1230" },
  { iconColor: "#EF4444", iconBg: "#2D1014" },
  { iconColor: "#06B6D4", iconBg: "#0C2030" },
  { iconColor: "#D82C15", iconBg: "#2D1010" },
  { iconColor: "#22C55E", iconBg: "#0C2010" },
  { iconColor: "#8B5CF6", iconBg: "#1A1030" },
];

// ─── Helper: get severity colours ────────────────────────────────────────────

const getSeverityColors = (sev: string | undefined) => {
  if (sev === "High" || sev === "Critical") return { border: "#D82C15", bg: "#2D1010", text: "#D82C15" };
  if (sev === "Medium") return { border: "#F5A623", bg: "#2A1E08", text: "#F5A623" };
  if (sev === "Low") return { border: "#22C55E", bg: "#0A1F0F", text: "#22C55E" };
  return { border: "#2D3748", bg: "transparent", text: "#6B7280" };
};

const getSeverityOptColor = (opt: string) => {
  if (opt === "Low") return "#22C55E";
  if (opt === "Medium") return "#F5A623";
  return "#D82C15";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThreatAssessmentChecklist() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [severity, setSeverity] = useState<Record<string, string>>({});
  const [sevDropdown, setSevDropdown] = useState<string | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    variant?: "danger" | "info" | "success";
    confirmText?: string;
  }>({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const showAppAlert = (
    title: string,
    description: string,
    onConfirm?: () => void | Promise<void>,
    variant: "danger" | "info" | "success" = "info",
    confirmText: string = "Confirm"
  ) => {
    setModalConfig({
      title,
      description,
      onConfirm: onConfirm || (() => setModalVisible(false)),
      onCancel: () => setModalVisible(false),
      variant,
      confirmText,
    });
    setModalVisible(true);
  };

  const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
  const canGenerate = progressPercent >= 75;

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/operative-tools/threat-tool/", { requireAuth: true });
      const { definition, state } = response.data;

      // Map definition to categories
      const mappedCats: Category[] = definition.map((sec: any, idx: number) => ({
        id: sec.slug,
        title: sec.title,
        icon: sec.icon_name,
        ...CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        items: sec.questions.map((q: any) => ({
          key: q.key,
          label: q.label
        }))
      }));

      setCategories(mappedCats);
      if (mappedCats.length > 0) {
        setExpanded({ [mappedCats[0].id]: true });
      }

      // Map state to local state
      const initialChecked: Record<string, boolean> = {};
      const initialSeverity: Record<string, string> = {};

      Object.entries(state.current_answers || {}).forEach(([key, val]: [string, any]) => {
        initialChecked[key] = !!val.is_completed;
        if (val.level) initialSeverity[key] = val.level;
      });

      setChecked(initialChecked);
      setSeverity(initialSeverity);
    } catch (error: any) {
      showAppAlert("Error", error.message || "Failed to load checklist", undefined, "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Auto Save ─────────────────────────────────────────────────────────────

  const debouncedSave = useCallback(
    debounce(async (answers: Record<string, any>) => {
      try {
        await api.patch("/operative-tools/threat-state/", { current_answers: answers }, { requireAuth: true });
      } catch (error) {
        console.error("Auto-save failed", error);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (loading) return;

    const answers: Record<string, any> = {};
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (checked[item.key] || severity[item.key]) {
          answers[item.key] = {
            is_completed: !!checked[item.key],
            level: severity[item.key] || null
          };
        }
      });
    });

    debouncedSave(answers);
  }, [checked, severity, categories, loading]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const toggleCheck = (key: string) => {
    if (!severity[key]) {
      showAppAlert("Severity Required", "Please select a severity level before marking this item as checked.", undefined, "info");
      return;
    }
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setSeverityFor = (key: string, val: string) => {
    setSeverity(prev => ({ ...prev, [key]: val }));
    setChecked(prev => ({ ...prev, [key]: true })); // Auto-check when level selected
    setSevDropdown(null);
  };

  const catChecked = (cat: Category) =>
    cat.items.filter((item) => checked[item.key]).length;

  const handleReset = async () => {
    showAppAlert(
      "Reset Checklist",
      "Are you sure you want to clear all progress?",
      async () => {
        try {
          await api.post("/operative-tools/threat-reset/", {}, { requireAuth: true });
          setChecked({});
          setSeverity({});
          setModalVisible(false);
        } catch (error: any) {
          showAppAlert("Error", error.message || "Reset failed", undefined, "danger");
        }
      },
      "danger",
      "Reset"
    );
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      // Collect latest answers to prevent race condition with auto-save
      const latestAnswers: Record<string, any> = {};
      categories.forEach(cat => {
        cat.items.forEach(item => {
          if (checked[item.key] || severity[item.key]) {
            latestAnswers[item.key] = {
              is_completed: !!checked[item.key],
              level: severity[item.key] || null
            };
          }
        });
      });

      const response = await api.post("/operative-tools/threat-generate/", { current_answers: latestAnswers }, { requireAuth: true });
      router.push({
        pathname: "/risk-report",
        params: { report: JSON.stringify(response.data) }
      });
    } catch (error: any) {
      showAppAlert("Error", error.message || "Failed to generate report", undefined, "danger");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Threat Assessment</Text>
        <TouchableOpacity onPress={handleReset} style={{ marginLeft: 'auto' }}>
          <Text style={{ color: '#E05252', fontSize: 12, fontWeight: '600' }}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Text style={styles.subtitle}>
            Complete the checklist to generate an AI-powered risk report
          </Text>

          {/* Progress Row */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>{totalChecked}/{totalItems} items</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progressPercent}% complete</Text>

          {/* Categories */}
          {categories.map(cat => {
            const isOpen = expanded[cat.id];
            const done = catChecked(cat);
            const catPercent = Math.round((done / cat.items.length) * 100);
            const CatIcon = ICON_MAP[cat.icon as keyof typeof ICON_MAP] || Shield;

            return (
              <View key={cat.id} style={styles.categoryWrap}>
                {/* Category Header */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(cat.id)}
                  style={styles.categoryHeader}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: cat.iconBg }]}>
                      <CatIcon size={18} color={cat.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Text style={styles.categoryCount}>{done}/{cat.items.length} completed</Text>
                    </View>
                  </View>
                  <View style={styles.categoryHeaderRight}>
                    <Text style={styles.categoryPercent}>{catPercent}%</Text>
                    {isOpen ? (
                      <ChevronUp size={16} color="#6B7280" />
                    ) : (
                      <ChevronDown size={16} color="#6B7280" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Items */}
                {isOpen && (
                  <View style={styles.itemsContainer}>
                    {cat.items.map((item, i) => {
                      const key = item.key;
                      const isChecked = !!checked[key];
                      const sev = severity[key];
                      const showDrop = sevDropdown === key;
                      const sevColors = getSeverityColors(sev);

                      return (
                        <View key={key} style={styles.itemRow}>
                          <View style={styles.itemMain}>
                            {/* Checkbox + Text */}
                            <TouchableOpacity
                              onPress={() => toggleCheck(key)}
                              style={styles.itemCheckRow}
                            >
                              <View style={[
                                styles.checkbox,
                                isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
                              ]}>
                                {isChecked && <Check size={12} color="white" />}
                              </View>
                              <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                                {item.label}
                              </Text>
                            </TouchableOpacity>

                            {/* Severity Dropdown */}
                            <View style={[styles.dropdownWrap, showDrop && { zIndex: 100 }]}>
                              <TouchableOpacity
                                onPress={() => setSevDropdown(showDrop ? null : key)}
                                style={[
                                  styles.severityBtn,
                                  { borderColor: sevColors.border, backgroundColor: sevColors.bg },
                                ]}
                              >
                                <Text style={[styles.severityBtnText, { color: sevColors.text }]}>
                                  {sev || "Severity"}
                                </Text>
                                <ChevronDown size={10} color="#6B7280" />
                              </TouchableOpacity>

                              {showDrop && (
                                <View style={styles.dropdownMenu}>
                                  {SEVERITY_OPTS.map(opt => (
                                    <TouchableOpacity
                                      key={opt}
                                      onPress={() => setSeverityFor(key, opt)}
                                      style={styles.dropdownItem}
                                    >
                                      <Text style={[styles.dropdownItemText, { color: getSeverityOptColor(opt) }]}>
                                        {opt}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={canGenerate && !generating ? 0.8 : 1}
          onPress={() => canGenerate && !generating && handleGenerate()}
          style={[styles.generateBtn, canGenerate ? styles.generateBtnActive : styles.generateBtnDisabled]}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.generateBtnText, !canGenerate && styles.generateBtnTextDisabled]}>
              {canGenerate
                ? "Generate AI Risk Report →"
                : `Complete ${75 - progressPercent}% more to generate report`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalVisible(false)}
        variant={modalConfig.variant}
        confirmText={modalConfig.confirmText}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1520",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1E2D3D",
    backgroundColor: "#0D1520",
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: "#ffffff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  progressCount: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: "monospace",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#1E2D3D",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90D9",
    borderRadius: 4,
  },
  progressPercent: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "right",
    marginBottom: 24,
  },

  // Category
  categoryWrap: {
    marginBottom: 12,
  },
  categoryHeader: {
    backgroundColor: "#131C2E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryCount: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 2,
  },
  categoryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryPercent: {
    color: "#9ca3af",
    fontSize: 14,
    fontFamily: "monospace",
  },

  // Items
  itemsContainer: {
    backgroundColor: "#0F1824",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#1E2D3D",
    marginTop: -4,
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2D3D",
  },
  itemMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
  },
  checkboxUnchecked: {
    borderColor: "#2D3748",
    backgroundColor: "transparent",
  },
  itemText: {
    color: "#D1D5DB",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  itemTextChecked: {
    color: "#6b7280",
    textDecorationLine: "line-through",
  },

  // Severity
  dropdownWrap: {
    position: "relative",
  },
  severityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  severityBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: 32,
    zIndex: 50,
    backgroundColor: "#1A2535",
    borderWidth: 1,
    borderColor: "#2D3748",
    borderRadius: 12,
    overflow: "hidden",
    width: 96,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3748",
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    backgroundColor: "#0D1520",
    borderTopWidth: 1,
    borderTopColor: "#1E2D3D",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  generateBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generateBtnActive: {
    backgroundColor: "#4A90D9",
  },
  generateBtnDisabled: {
    backgroundColor: "#1E2D3D",
  },
  generateBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#ffffff",
  },
  generateBtnTextDisabled: {
    color: "#6b7280",
  },
});
