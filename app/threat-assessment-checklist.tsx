import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
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
  ShieldAlert,
  Save,
} from "lucide-react-native";
import { api } from "../lib/api";
import AlertModal from "../components/ui/AlertModal";
import { GuardianLoader } from "../components/ui";

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

const getSeverityColors = (sev: string | undefined) => {
  if (sev === "High" || sev === "Critical") return { border: "#D82C15", bg: "#2D1010", text: "#D82C15" };
  if (sev === "Medium") return { border: "#F5A623", bg: "#2A1E08", text: "#F5A623" };
  if (sev === "Low") return { border: "#22C55E", bg: "#0A1F0F", text: "#22C55E" };
  return { border: "#2D3748", bg: "transparent", text: "#9CA3AF" };
};

const getSeverityOptColor = (opt: string) => {
  if (opt === "Low") return "#22C55E";
  if (opt === "Medium") return "#F5A623";
  return "#D82C15";
};

export default function ThreatAssessmentChecklist() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [severity, setSeverity] = useState<Record<string, string>>({});
  const [sevDropdown, setSevDropdown] = useState<string | null>(null);

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
    onConfirm: () => { },
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/operative-tools/threat-tool/", { requireAuth: true });
      const { definition, state } = response.data;

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
    setChecked(prev => ({ ...prev, [key]: true }));
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
      <View className="flex-1 bg-white">
        <StatusBar style="light" />
        <View className="bg-[#0D1520] pt-14 pb-5 px-5">
          <View className="flex-row items-center mb-6">
            <ArrowLeft size={20} color="#9ca3af" />
            <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
          </View>
          <Text className="text-white text-2xl font-black uppercase tracking-wider">Threat Assessment</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#D82C15" />
        </View>
      </View>
    );
  }

  if (generating) {
    return (
      <GuardianLoader
        title="Guardian is generating your report"
        steps={[
          "Analyzing threat matrix...",
          "Evaluating severity indicators...",
          "Compiling protective recommendations...",
          "Almost ready..."
        ]}
        iconType="shield"
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={"padding"}
      className="flex-1 bg-white"
    >
      <StatusBar style="light" />

      <View className="bg-[#0D1520] pt-14 pb-0">
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <ArrowLeft size={20} color="#9ca3af" />
              <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleReset}>
              <Text className="text-[#E05252] text-xs font-semibold uppercase tracking-wider">Reset</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-end justify-between mb-2">
            <Text className="text-white text-2xl font-black uppercase tracking-wider">
              Threat Assessment
            </Text>
            <View className="items-end">
              <Text className="text-gray-400 text-xs font-medium">
                {totalChecked}/{totalItems} items
              </Text>
              <Text className="text-[#D82C15] text-sm font-bold mt-0.5">
                {progressPercent}%
              </Text>
            </View>
          </View>
        </View>

        <View className="h-1 bg-[#2D3748] w-full flex-row">
          <View
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#D82C15]"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text className="text-gray-400 text-sm mb-6">
          Complete the checklist to generate an AI-powered risk report (minimum 75% progress required)
        </Text>

        {categories.map((cat) => {
          const isOpen = expanded[cat.id];
          const done = catChecked(cat);
          const catPercent = Math.round((done / cat.items.length) * 100);
          const CatIcon = ICON_MAP[cat.icon as keyof typeof ICON_MAP] || Shield;

          return (
            <View key={cat.id} className="mb-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(cat.id)}
                className="flex-row items-center justify-between px-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl mb-2 shadow-sm"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    style={{ backgroundColor: cat.iconBg }}
                    className="w-8 h-8 rounded-lg items-center justify-center"
                  >
                    <CatIcon size={14} color={cat.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-bold text-sm uppercase tracking-wide">
                      {cat.title}
                    </Text>
                    <Text className="text-gray-400 text-[10px] mt-0.5">
                      {done}/{cat.items.length} completed
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <Text className="text-gray-500 font-mono text-sm font-semibold">
                    {catPercent}%
                  </Text>
                  {isOpen ? (
                    <ChevronUp size={16} color="#9ca3af" />
                  ) : (
                    <ChevronDown size={16} color="#9ca3af" />
                  )}
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View className="px-1 py-1 mb-2">
                  {cat.items.map((item) => {
                    const key = item.key;
                    const isChecked = !!checked[key];
                    const sev = severity[key];
                    const showDrop = sevDropdown === key;
                    const sevColors = getSeverityColors(sev);

                    const rowBg = isChecked ? "bg-[#F4F9F6]" : "bg-[#141A24]";
                    const rowBorder = isChecked ? "border-[#E0EBE4]" : "border-transparent";
                    const textClass = isChecked ? "text-gray-600 font-semibold" : "text-white font-medium";
                    const checkboxBg = isChecked ? "bg-[#2E8B57]" : "bg-transparent";
                    const checkboxBorder = isChecked ? "border-[#2E8B57]" : "border-[#2D3748]";

                    return (
                      <View
                        key={key}
                        className={`flex-row items-center px-4 py-3.5 rounded-xl mb-2 border ${rowBg} ${rowBorder}`}
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toggleCheck(key)}
                          className="flex-row items-center flex-1 mr-3"
                        >
                          <View className={`w-5 h-5 rounded items-center justify-center border ${checkboxBg} ${checkboxBorder}`}>
                            {isChecked && <Check size={12} color="white" strokeWidth={3} />}
                          </View>
                          <Text className={`text-sm ml-3 flex-1 ${textClass}`}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>

                        <View style={{ zIndex: showDrop ? 100 : 1 }}>
                          <TouchableOpacity
                            onPress={() => setSevDropdown(showDrop ? null : key)}
                            style={{
                              borderColor: sevColors.border,
                              backgroundColor: sevColors.bg,
                            }}
                            className="px-4 py-2 rounded-xl border flex-row items-center gap-2"
                          >
                            <Text
                              style={{ color: sevColors.text }}
                              className="text-xs font-bold uppercase"
                            >
                              {sev || "Severity"}
                            </Text>
                            <ChevronDown size={12} color="#6B7280" />
                          </TouchableOpacity>

                          {showDrop && (
                            <View
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                              }}
                              className="absolute right-0 top-11 z-50 bg-[#1A2535] border border-[#2D3748] rounded-xl overflow-hidden w-32"
                            >
                              {SEVERITY_OPTS.map((opt) => (
                                <TouchableOpacity
                                  key={opt}
                                  onPress={() => setSeverityFor(key, opt)}
                                  className="px-4 py-3 border-b border-[#2D3748] active:bg-[#202E42]"
                                >
                                  <Text
                                    style={{ color: getSeverityOptColor(opt) }}
                                    className="text-sm font-black text-center"
                                  >
                                    {opt}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 pb-8 items-center justify-between gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-semibold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={!canGenerate || generating}
          className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center gap-2 ${canGenerate ? "bg-[#D82C15]" : "bg-gray-300"
            }`}
        >
          {generating ? (
            <ActivityIndicator size={18} color="white" />
          ) : (
            <>
              <Save size={18} color="white" />
              <Text className="text-white font-bold tracking-wide">
                {canGenerate ? "GENERATE REPORT" : `NEED ${75 - progressPercent}% MORE`}
              </Text>
            </>
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
    </KeyboardAvoidingView>
  );
}
