import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Save,
  AlertTriangle,
  Building,
  MapPin,
  Navigation,
  Car,
  User,
} from "lucide-react-native";
import { fetchTemplates, submitOperation, syncPendingOperations, SearchTemplate } from "../lib/searchOperations";

export default function SearchOperations() {
  const [templates, setTemplates] = useState<SearchTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [opName, setOpName] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [failureNotes, setFailureNotes] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchTemplates();
        setTemplates(data);

        const initialAnswers: Record<string, Record<string, boolean>> = {};
        const initialExpanded: Record<string, boolean> = {};

        data.forEach((template, index) => {
          initialExpanded[template.slug] = index === 0;
          initialAnswers[template.slug] = {};
          template.questions.forEach((q) => {
            initialAnswers[template.slug][q.key] = false;
          });
        });

        setAnswers(initialAnswers);
        setExpanded(initialExpanded);
      } catch (error) {
        Alert.alert("Error", "Could not load search templates.");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    syncPendingOperations().catch(console.error);

    const appStateSub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        syncPendingOperations().catch(console.error);
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, []);

  const toggleExpand = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleToggle = (templateSlug: string, questionKey: string, val: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [templateSlug]: {
        ...prev[templateSlug],
        [questionKey]: val,
      },
    }));
  };

  const toggleQuestion = (templateSlug: string, questionKey: string) => {
    const currentVal = answers[templateSlug]?.[questionKey] !== false;
    handleToggle(templateSlug, questionKey, !currentVal);
  };

  const totalQuestions = templates.reduce((acc, t) => acc + t.questions.length, 0);
  const passedQuestions = templates.reduce((acc, t) => {
    const templateAnswers = answers[t.slug] || {};
    return acc + Object.values(templateAnswers).filter(Boolean).length;
  }, 0);
  const progressPercent = totalQuestions > 0 ? Math.round((passedQuestions / totalQuestions) * 100) : 100;

  const hasFailures = Object.values(answers).some((templateAnswers) =>
    Object.values(templateAnswers).some((value) => value === false)
  );

  const canSubmit = !hasFailures || failureNotes.trim() !== "";

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const logs = Object.keys(answers).map((slug) => ({
      template_slug: slug,
      answers: answers[slug],
    }));

    const dateStr = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const payload = {
      name: opName.trim() || `Search Operation - ${dateStr}`,
      notes: hasFailures ? failureNotes : "",
      logs,
    };

    try {
      setLoading(true);
      const result = await submitOperation(payload);
      setLoading(false);
      if (result.queued) {
        Alert.alert(
          "Offline Mode",
          "Your operation checklist has been queued locally and will sync once internet access is restored.",
          [{ text: "OK", onPress: () => router.navigate("/tools") }]
        );
      } else {
        router.navigate("/tool-complete");
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Submission Failed", err.message || "An error occurred.");
    }
  };

  if (loading && templates.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="light" />
        <View className="bg-[#0D1520] pt-14 pb-5 px-5">
          <View className="flex-row items-center mb-6">
            <ArrowLeft size={20} color="#9ca3af" />
            <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
          </View>
          <Text className="text-white text-2xl font-black uppercase tracking-wider">Search Operations</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#D82C15" />
        </View>
      </View>
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={20} color="#9ca3af" />
            <Text className="text-gray-400 font-medium ml-2">Operational Tools</Text>
          </TouchableOpacity>

          <View className="flex-row items-end justify-between mb-2">
            {/* <View className="border border-[#D82C15]/30 bg-[#D82C15]/10 px-3 py-1 rounded-full"> */}
            <Text className="text-white text-2xl font-black uppercase tracking-wider">
              Search Operations
            </Text>
            {/* </View> */}
            <View className="items-end">
              <Text className="text-gray-400 text-xs font-medium">
                {passedQuestions}/{totalQuestions} steps
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
        {templates.map((template) => {
          const isOpen = expanded[template.slug];
          const templateAnswers = answers[template.slug] || {};
          const totalQuestionsInTemplate = template.questions.length;
          const passedCount = Object.values(templateAnswers).filter(Boolean).length;
          const IconComponent = getSearchIcon(template.slug);
          const iconStyle = getIconStyles(template.slug);

          return (
            <View key={template.slug} className="mb-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(template.slug)}
                className="flex-row items-center justify-between px-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl mb-2 shadow-sm"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className={`w-8 h-8 rounded-lg ${iconStyle.bg} items-center justify-center`}>
                    <IconComponent size={14} color={iconStyle.color} />
                  </View>
                  <Text className="text-gray-800 font-bold text-sm uppercase tracking-wide flex-1">
                    {template.title}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {isOpen ? (
                    <ChevronUp size={16} color="#9ca3af" />
                  ) : (
                    <ChevronDown size={16} color="#9ca3af" />
                  )}
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View className="px-1 py-1 mb-2">
                  {template.questions.map((question, qIndex) => {
                    const isPassed = templateAnswers[question.key] === true;
                    const idStr = String(qIndex + 1).padStart(2, "0");

                    const pillBg = isPassed ? "bg-[#F4F9F6]" : "bg-[#141A24]";
                    const pillBorder = isPassed ? "border-[#E0EBE4]" : "border-transparent";
                    const textClasses = isPassed ? "text-gray-600 font-semibold" : "text-white font-medium";
                    const checkboxBg = isPassed ? "bg-[#2E8B57]" : "bg-transparent";
                    const checkboxBorder = isPassed ? "border-[#2E8B57]" : "border-[#2D3748]";

                    return (
                      <TouchableOpacity
                        key={question.key}
                        activeOpacity={0.8}
                        onPress={() => toggleQuestion(template.slug, question.key)}
                        className={`flex-row items-center px-4 py-3.5 rounded-xl mb-2 border ${pillBg} ${pillBorder}`}
                      >
                        <View className={`w-5 h-5 rounded items-center justify-center border ${checkboxBg} ${checkboxBorder}`}>
                          {isPassed && <Check size={12} color="white" strokeWidth={3} />}
                        </View>
                        <Text className={`text-[10px] ml-3 mr-2 font-medium ${isPassed ? "text-gray-400" : "text-gray-500"}`}>
                          {idStr}
                        </Text>
                        <Text className={`flex-1 text-sm ${textClasses}`}>
                          {question.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {hasFailures && (
          <View className="border-l-2 border-l-[#D82C15] pl-3 mb-4">
            <View className="flex-row items-center gap-1.5 mb-2">
              {/* <AlertTriangle size={12} color="#D82C15" /> */}
              <Text className="text-[#D82C15] text-[10px] font-black uppercase tracking-widest">
                Notes *
              </Text>
            </View>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm shadow-inner"
              placeholder="Provide immediate risk mitigation details and notes..."
              placeholderTextColor="#94A3B8"
              value={failureNotes}
              onChangeText={setFailureNotes}
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: "top", height: 100 }}
            />
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex-row px-5 py-4 pb-8 items-center justify-between gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#2A3B54] w-[110px] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-semibold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center gap-2 ${canSubmit ? "bg-[#D82C15]" : "bg-gray-300"
            }`}
        >
          <Save size={18} color="white" />
          <Text className="text-white font-bold tracking-wide">SUBMIT & SAVE</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getSearchIcon = (slug: string) => {
  if (slug.includes("building")) return Building;
  if (slug.includes("venue")) return MapPin;
  if (slug.includes("route")) return Navigation;
  if (slug.includes("vehicle")) return Car;
  if (slug.includes("person")) return User;
  return Search;
};

const getIconStyles = (slug: string) => {
  if (slug.includes("building")) return { bg: "bg-blue-50", color: "#2563EB" };
  if (slug.includes("venue")) return { bg: "bg-purple-50", color: "#7C3AED" };
  if (slug.includes("route")) return { bg: "bg-amber-50", color: "#D97706" };
  if (slug.includes("vehicle")) return { bg: "bg-red-50", color: "#DC2626" };
  if (slug.includes("person")) return { bg: "bg-emerald-50", color: "#059669" };
  return { bg: "bg-gray-100", color: "#475569" };
};
