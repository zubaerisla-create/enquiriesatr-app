import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { rs, rf, wp } from "../utils/responsive";

import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Lock, 
  Target, 
  ChevronRight 
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchModuleDetail, fetchModuleProgress } from "../lib/modules";

const CATEGORY_COLORS: Record<string, string> = {
  FOUNDATION: "#3B82F6",
  TACTICAL: "#F97316",
  OPERATIONS: "#22C55E",
  LEGAL: "#A855F7",
};

export default function ModuleDetails() {
  const { id } = useLocalSearchParams();
  const moduleId = Number(id);

  const { data: moduleDetail, isLoading: moduleLoading } = useQuery({
    queryKey: ["module-detail", moduleId],
    queryFn: () => fetchModuleDetail(moduleId),
    enabled: !!moduleId,
  });

  const { data: progressData } = useQuery({
    queryKey: ["modules-progress"],
    queryFn: fetchModuleProgress,
  });

  if (moduleLoading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center", backgroundColor: "#111824" }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const mappedSubsections = (moduleDetail?.subsections || []).map((sub, index) => {
    const subProg = progressData?.subsections.find((p) => p.subsection === sub.id);
    const isComplete = subProg?.is_completed || false;
    const totalWords = sub.content.split(/\s+/).length;
    const minutes = Math.max(1, Math.round(totalWords / 200));
    let status: "complete" | "in_progress" = isComplete ? "complete" : "in_progress";
    return {
      id: String(index + 1).padStart(2, '0'),
      subsectionId: sub.id,
      title: sub.name,
      time: `${minutes} min`,
      status: status,
    };
  });

  const moduleProgress = progressData?.modules.find(p => p.module === moduleId);
  const progressPercent = moduleProgress?.progress_percent || 0;
  const completedCount = mappedSubsections.filter(s => s.status === "complete").length;
  const totalCount = mappedSubsections.length;
  const categoryColor = CATEGORY_COLORS[moduleDetail?.category || "FOUNDATION"] || "#3B82F6";

  const handleContinue = () => {
    const firstIncompleteIndex = mappedSubsections.findIndex(s => s.status !== "complete");
    const startIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
    router.push(`/lesson?moduleId=${moduleId}&startIndex=${startIndex}`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.darkHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#9ca3af" />
          <Text style={styles.backText}>Modules</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.foundationBadge, { borderColor: `${categoryColor}50`, backgroundColor: `${categoryColor}15` }]}>
              <Text style={[styles.foundationBadgeText, { color: categoryColor }]}>{moduleDetail?.category}</Text>
            </View>
            <Text style={styles.moduleTitle}>{moduleDetail?.name}</Text>
            <Text style={styles.moduleDesc}>
              {moduleDetail?.description}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={14} color="#9ca3af" />
                <Text style={styles.metaText}>{moduleDetail?.hours}h {moduleDetail?.minutes}m</Text>
              </View>
              <View style={styles.metaItem}>
                <CheckCircle size={14} color="#9ca3af" />
                <Text style={styles.metaText}>{completedCount}/{totalCount} sections</Text>
              </View>
            </View>
          </View>

          <View style={[styles.progressRing, { borderColor: `${categoryColor}50` }]}>
            <View style={[styles.progressRingArc, { borderColor: categoryColor }]} />
            <Text style={styles.progressRingText}>{progressPercent}%</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>SECTIONS</Text>

          {mappedSubsections.map((lesson, index) => {
            const isComplete = lesson.status === "complete";
            const isProgress = lesson.status === "in_progress";

            return (
              <TouchableOpacity
                key={lesson.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/lesson?moduleId=${moduleId}&startIndex=${index}`)}
                style={[
                  styles.lessonCard,
                  isComplete && styles.lessonCardComplete,
                  isProgress && styles.lessonCardProgress,
                ]}
              >
                <View style={styles.lessonLeft}>
                  <Text style={[styles.lessonId, isProgress && styles.lessonIdActive]}>
                    {lesson.id}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lessonTitle, isProgress && styles.lessonTitleProgress]} numberOfLines={1} ellipsizeMode="tail">
                      {lesson.title}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <Text style={[styles.lessonTime, isProgress && { color: "#6b7280" }]}>
                        {lesson.time}
                      </Text>
                      {isComplete && (
                        <Text style={styles.completeTag}>✓ Complete</Text>
                      )}
                      {isProgress && (
                        <View style={styles.inProgressTag}>
                          <View style={styles.inProgressDot} />
                          <Text style={styles.inProgressText}>Read now</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {isComplete && <CheckCircle size={18} color="#059669" />}
                {isProgress && <PlayCircle size={18} color="#D82C15" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueBtn}
        >
          <Text style={styles.continueBtnText}>CONTINUE MODULE</Text>
          <ChevronRight size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  darkHeader: {
    backgroundColor: "#111824",
    paddingTop: rs(56),
    paddingBottom: rs(32),
    paddingHorizontal: rs(20),
    borderBottomLeftRadius: rs(32),
    borderBottomRightRadius: rs(32),
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(24),
  },
  backText: {
    color: "#9ca3af",
    fontWeight: "500",
    marginLeft: rs(8),
    fontSize: rf(16),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
    paddingRight: rs(16),
  },
  foundationBadge: {
    borderWidth: 1,
    borderColor: "rgba(216,44,21,0.3)",
    backgroundColor: "rgba(216,44,21,0.1)",
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    borderRadius: rs(999),
    alignSelf: "flex-start",
    marginBottom: rs(12),
  },
  foundationBadgeText: {
    color: "#D82C15",
    fontSize: rf(10),
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  moduleTitle: {
    color: "#ffffff",
    fontSize: rf(28),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: rs(8),
    lineHeight: rf(32),
  },
  moduleDesc: {
    color: "#9ca3af",
    fontSize: rf(14),
    lineHeight: rf(24),
    marginBottom: rs(16),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(16),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
  },
  metaText: {
    color: "#9ca3af",
    fontSize: rf(12),
    fontFamily: "monospace",
  },
  progressRing: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    borderWidth: 3,
    borderColor: "#2D3748",
    backgroundColor: "#111824",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  progressRingArc: {
    position: "absolute",
    top: 0,
    right: 0,
    width: rs(40),
    height: rs(80),
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#D82C15",
    borderTopRightRadius: rs(40),
    borderBottomRightRadius: rs(40),
  },
  progressRingText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: rf(18),
  },
  content: {
    paddingHorizontal: rs(20),
    paddingTop: rs(32),
  },
  sectionLabel: {
    color: "#6b7280",
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: rs(16),
  },
  sectionLabel2: {
    color: "#6b7280",
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: rs(24),
    marginBottom: rs(16),
  },
  lessonCard: {
    borderRadius: rs(16),
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    marginBottom: rs(12),
    flexDirection: "row",
    alignItems: "center",
  },
  lessonCardComplete: {
    backgroundColor: "#131C2E",
  },
  lessonCardProgress: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#D82C15",
  },
  lessonCardLocked: {
    backgroundColor: "#788086",
  },
  lessonLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(16),
  },
  lessonId: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: rf(12),
  },
  lessonIdActive: {
    color: "#D82C15",
  },
  lessonTitle: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: rf(16),
    marginBottom: rs(4),
  },
  lessonTitleLocked: {
    opacity: 0.6,
  },
  lessonTitleProgress: {
    color: "#131C2E",
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonTime: {
    color: "#D1D5DB",
    fontFamily: "monospace",
    fontSize: rf(10),
  },
  completeTag: {
    color: "#059669",
    fontFamily: "monospace",
    fontSize: rf(10),
    marginLeft: rs(4),
  },
  inProgressTag: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: rs(4),
  },
  inProgressDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: "#D82C15",
    marginRight: rs(4),
  },
  inProgressText: {
    color: "#D82C15",
    fontFamily: "monospace",
    fontSize: rf(10),
  },
  assessmentCard: {
    backgroundColor: "#111824",
    borderRadius: rs(16),
    padding: rs(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assessmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(16),
  },
  assessmentIcon: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(12),
    backgroundColor: "#2D1A1E",
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: rf(16),
    marginBottom: rs(2),
  },
  assessmentMeta: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: rf(10),
  },
  startBtn: {
    backgroundColor: "#D82C15",
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
    borderRadius: rs(8),
  },
  startBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: rf(14),
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: rs(20),
    paddingTop: rs(16),
    paddingBottom: rs(24),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueBtn: {
    width: "100%",
    backgroundColor: "#D82C15",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
  },
  continueBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: rf(14),
  },
});

