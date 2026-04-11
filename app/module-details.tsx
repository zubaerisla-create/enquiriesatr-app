import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Lock, 
  Target, 
  ChevronRight 
} from "lucide-react-native";

const LESSONS = [
  { id: "01", title: "Introduction to Close Protection", time: "25 min", status: "complete" },
  { id: "02", title: "The CP Team Structure", time: "30 min", status: "complete" },
  { id: "03", title: "Threat & Risk Assessment", time: "35 min", status: "in_progress" },
  { id: "04", title: "The Intelligence Cycle", time: "28 min", status: "locked" },
  { id: "05", title: "Principal Profiling", time: "22 min", status: "locked" },
];

export default function ModuleDetails() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Dark Header */}
      <View style={styles.darkHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#9ca3af" />
          <Text style={styles.backText}>Modules</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.foundationBadge}>
              <Text style={styles.foundationBadgeText}>FOUNDATION</Text>
            </View>
            <Text style={styles.moduleTitle}>CP Fundamentals</Text>
            <Text style={styles.moduleDesc}>
              Core principles, roles, and responsibilities of close protection professionals operating in the modern security landscape.
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={14} color="#9ca3af" />
                <Text style={styles.metaText}>2h 30m</Text>
              </View>
              <View style={styles.metaItem}>
                <CheckCircle size={14} color="#9ca3af" />
                <Text style={styles.metaText}>2/5 lessons</Text>
              </View>
            </View>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View style={styles.progressRingArc} />
            <Text style={styles.progressRingText}>60%</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>LESSONS</Text>

          {LESSONS.map(lesson => {
            const isComplete = lesson.status === "complete";
            const isProgress = lesson.status === "in_progress";
            const isLocked = lesson.status === "locked";

            const CardEl = isProgress ? TouchableOpacity : View;

            return (
              <CardEl
                key={lesson.id}
                activeOpacity={0.8}
                onPress={isProgress ? () => router.push("/lesson") : undefined}
                style={[
                  styles.lessonCard,
                  isComplete && styles.lessonCardComplete,
                  isProgress && styles.lessonCardProgress,
                  isLocked && styles.lessonCardLocked,
                ]}
              >
                <View style={styles.lessonLeft}>
                  <Text style={[styles.lessonId, isProgress && styles.lessonIdActive]}>
                    {lesson.id}
                  </Text>
                  <View>
                    <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked, isProgress && styles.lessonTitleProgress]}>
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
                          <Text style={styles.inProgressText}>In progress</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {isComplete && <CheckCircle size={18} color="#059669" />}
                {isProgress && <PlayCircle size={18} color="#D82C15" />}
                {isLocked && <Lock size={16} color="#e5e7eb" />}
              </CardEl>
            );
          })}

          <Text style={styles.sectionLabel2}>MODULE ASSESSMENT</Text>

          <View style={styles.assessmentCard}>
            <View style={styles.assessmentLeft}>
              <View style={styles.assessmentIcon}>
                <Target size={24} color="#D82C15" />
              </View>
              <View>
                <Text style={styles.assessmentTitle}>CP Fundamentals</Text>
                <Text style={styles.assessmentTitle}>Assessment</Text>
                <Text style={styles.assessmentMeta}>5 questions · Pass mark: 70%</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/assessment/intro")}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push("/lesson")}
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
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backText: {
    color: "#9ca3af",
    fontWeight: "500",
    marginLeft: 8,
    fontSize: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  foundationBadge: {
    borderWidth: 1,
    borderColor: "rgba(216,44,21,0.3)",
    backgroundColor: "rgba(216,44,21,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  foundationBadgeText: {
    color: "#D82C15",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  moduleTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    lineHeight: 32,
  },
  moduleDesc: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: "monospace",
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    width: 40,
    height: 80,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#D82C15",
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
  },
  progressRingText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  sectionLabel2: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 16,
  },
  lessonCard: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
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
    gap: 16,
  },
  lessonId: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: 12,
  },
  lessonIdActive: {
    color: "#D82C15",
  },
  lessonTitle: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 16,
    marginBottom: 4,
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
    fontSize: 10,
  },
  completeTag: {
    color: "#059669",
    fontFamily: "monospace",
    fontSize: 10,
    marginLeft: 4,
  },
  inProgressTag: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  inProgressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D82C15",
    marginRight: 4,
  },
  inProgressText: {
    color: "#D82C15",
    fontFamily: "monospace",
    fontSize: 10,
  },
  assessmentCard: {
    backgroundColor: "#111824",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assessmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  assessmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2D1A1E",
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },
  assessmentMeta: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: 10,
  },
  startBtn: {
    backgroundColor: "#D82C15",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueBtn: {
    width: "100%",
    backgroundColor: "#D82C15",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 14,
  },
});
