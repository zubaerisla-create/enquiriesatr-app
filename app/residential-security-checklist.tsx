import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Home,
  Map,
  Maximize,
  Save,
  Shield,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GuardianLoader } from "../components/ui";
import AlertModal from "../components/ui/AlertModal";
import { api } from "../lib/api";

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
  map: Map,
  maximize: Maximize,
  home: Home,
  shield: Shield,
};

const STATUS_OPTS = ["Secure", "Issue Found", "N/A"];

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
];

const getStatusColors = (status: string | undefined) => {
  if (status === "Secure") return { border: "#22C55E", bg: "#0A1F0F", text: "#22C55E" };
  if (status === "Issue Found") return { border: "#EF4444", bg: "#2D1014", text: "#EF4444" };
  if (status === "N/A") return { border: "#4B5563", bg: "#1A2535", text: "#9CA3AF" };
  return { border: "#2D3748", bg: "transparent", text: "#9CA3AF" };
};

const getStatusOptColor = (opt: string) => {
  if (opt === "Secure") return "#22C55E";
  if (opt === "Issue Found") return "#EF4444";
  return "#9CA3AF";
};

export default function ResidentialSecurityChecklist() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [statusState, setStatusState] = useState<Record<string, string>>({});
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

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
      const response = await api.get("/operative-tools/residential-tool/", { requireAuth: true });
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
      const initialStatus: Record<string, string> = {};

      Object.entries(state.current_answers || {}).forEach(([key, val]: [string, any]) => {
        initialChecked[key] = !!val.is_completed;
        if (val.status) initialStatus[key] = val.status;
      });

      setChecked(initialChecked);
      setStatusState(initialStatus);
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
        await api.patch("/operative-tools/residential-state/", { current_answers: answers }, { requireAuth: true });
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
        if (checked[item.key] || statusState[item.key]) {
          answers[item.key] = {
            is_completed: !!checked[item.key],
            status: statusState[item.key] || null
          };
        }
      });
    });

    debouncedSave(answers);
  }, [checked, statusState, categories, loading]);

  const toggleCheck = (key: string) => {
    if (!statusState[key]) {
      showAppAlert("Status Required", "Please select a status before marking this item as checked.", undefined, "info");
      return;
    }
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setStatusFor = (key: string, val: string) => {
    setStatusState(prev => ({ ...prev, [key]: val }));
    setChecked(prev => ({ ...prev, [key]: true }));
    setStatusDropdown(null);
  };

  const catChecked = (cat: Category) =>
    cat.items.filter((item) => checked[item.key]).length;

  const handleReset = async () => {
    showAppAlert(
      "Reset Checklist",
      "Are you sure you want to clear all progress?",
      async () => {
        try {
          await api.post("/operative-tools/residential-reset/", {}, { requireAuth: true });
          setChecked({});
          setStatusState({});
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
          if (checked[item.key] || statusState[item.key]) {
            latestAnswers[item.key] = {
              is_completed: !!checked[item.key],
              status: statusState[item.key] || null
            };
          }
        });
      });

      const response = await api.post("/operative-tools/residential-generate/", { current_answers: latestAnswers }, { requireAuth: true });
      router.push({
        pathname: "/residential-report",
        params: { report: JSON.stringify(response.data) }
      });
    } catch (error: any) {
      showAppAlert("Error", error.message || "Failed to generate report", undefined, "danger");
    } finally {
      setGenerating(false);
    }
  };

  // if (loading) {
  //   return (
  //     <View className="flex-1 bg-white">
  //       <StatusBar style="light" />
  //       <View className="bg-[#0D1520] pt-14 pb-5 px-5">
  //         <View className="flex-row items-center mb-6">
  //           <ArrowLeft size={20} color="#9ca3af" />
  //           <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
  //         </View>
  //         <Text className="text-white text-2xl font-black uppercase tracking-wider">Residential Security</Text>
  //       </View>
  //       <View className="flex-1 justify-center items-center">
  //         <ActivityIndicator size="large" color="#D82C15" />
  //       </View>
  //     </View>
  //   );
  // }
  const isInitialLoading = loading;


  if (generating) {
    return (
      <GuardianLoader
        title="Guardian is generating your report"
        steps={[
          "Analyzing perimeter logs...",
          "Evaluating cordon integrity...",
          "Compiling handover protocols...",
          "Almost ready..."
        ]}
        iconType="guardian"
      />
    );
  }

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-white">

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
                Residential Security
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
        {isInitialLoading ? (
          <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#D82C15" />
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1 px-5 pt-4 bg-white"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 140 }}
            >
              <Text className="text-gray-400 text-sm mb-6">
                Complete the checklist to generate an AI-powered handover report
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
                          const status = statusState[key];
                          const showDrop = statusDropdown === key;
                          const statusCol = getStatusColors(status);

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
                                  onPress={() => setStatusDropdown(showDrop ? null : key)}
                                  style={{
                                    borderColor: statusCol.border,
                                    backgroundColor: statusCol.bg,
                                  }}
                                  className="px-4 py-2 rounded-xl border flex-row items-center gap-2"
                                >
                                  <Text
                                    style={{ color: statusCol.text }}
                                    className="text-xs font-bold uppercase"
                                  >
                                    {status || "Status"}
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
                                    {STATUS_OPTS.map((opt) => (
                                      <TouchableOpacity
                                        key={opt}
                                        onPress={() => setStatusFor(key, opt)}
                                        className="px-4 py-3 border-b border-[#2D3748] active:bg-[#202E42]"
                                        style={{
                                          borderBottomWidth: opt === "N/A" ? 0 : 1
                                        }}
                                      >
                                        <Text
                                          style={{ color: getStatusOptColor(opt) }}
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
          </>
        )}

        <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 items-center justify-between gap-4">
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
    </SafeAreaView>
  );
}
