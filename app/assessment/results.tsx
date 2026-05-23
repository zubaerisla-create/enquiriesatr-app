import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchModuleDetail } from "../../lib/modules";
import { fetchAssessmentDetail } from "../../lib/assessments";
import { ActivityIndicator } from "react-native";
import {
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Check,
  X
} from "lucide-react-native";

export default function AssessmentResults() {
  const queryClient = useQueryClient();
  const { userAnswers, questions: questionsParam, moduleId, attemptId } = useLocalSearchParams<{
    userAnswers?: string;
    questions?: string;
    moduleId?: string;
    attemptId?: string;
  }>();

  const idNum = parseInt(String(moduleId || ""), 10);
  const { data: moduleDetail } = useQuery({
    queryKey: ["module-detail", idNum],
    queryFn: () => fetchModuleDetail(idNum),
    enabled: !isNaN(idNum),
  });

  const attemptIdNum = parseInt(String(attemptId || ""), 10);
  const { data: attemptDetail, isLoading: isLoadingAttempt } = useQuery({
    queryKey: ["assessment-attempt-detail", attemptIdNum],
    queryFn: () => fetchAssessmentDetail(attemptIdNum),
    enabled: !isNaN(attemptIdNum),
  });

  let answers: Record<number, string> = {};
  let questions: any[] = [];
  let score = 0;
  let percent = 0;
  let passed = false;
  let moduleName = "";

  if (!isNaN(attemptIdNum) && attemptDetail) {
    percent = attemptDetail.percent;
    score = attemptDetail.score;
    passed = attemptDetail.passed;
    moduleName = attemptDetail.module_name;
    questions = attemptDetail.answers || [];
    answers = (attemptDetail.answers || []).reduce((acc: any, q: any) => {
      acc[q.id] = q.selectedOption;
      return acc;
    }, {});
  } else {
    if (userAnswers) {
      try {
        answers = JSON.parse(userAnswers);
      } catch (e) {
        console.error(e);
      }
    }
    if (questionsParam) {
      try {
        questions = JSON.parse(questionsParam);
      } catch (e) {
        console.error(e);
      }
    }
    questions.forEach(q => {
      if (answers[q.id] === q.correctId) score++;
    });
    percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    passed = percent >= 70;
    moduleName = moduleDetail?.name || "Module Assessment";
  }

  const currentModuleId = !isNaN(attemptIdNum) && attemptDetail ? attemptDetail.module_id : moduleId;

  if (!isNaN(attemptIdNum) && isLoadingAttempt) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#D82C15" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.banner}>
        <View style={[styles.scoreCircle, passed ? styles.scoreCirclePassed : styles.scoreCircleFailed]}>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>

        <View style={[styles.badge, passed ? styles.badgePassed : styles.badgeFailed]}>
          {passed ? (
            <Award size={14} color="#10B981" />
          ) : (
            <AlertCircle size={14} color="#EF4444" />
          )}
          <Text style={[styles.badgeText, passed ? styles.badgeTextPassed : styles.badgeTextFailed]}>
            {passed ? "PASSED" : "FAILED"}
          </Text>
        </View>

        <Text style={styles.assessmentTitle}>
          {moduleName ? `${moduleName} Assessment` : "Module Assessment"}
        </Text>
        <Text style={styles.scoreSubtitle}>Pass mark: 70% · You scored {percent}%</Text>
      </View>

      <View style={styles.body}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
          <Text style={styles.sectionLabel}>QUESTION BREAKDOWN</Text>

          {questions.map(q => {
            const userAnswerId = answers[q.id];
            const isCorrect = userAnswerId === q.correctId;
            const userAnswerText = q.options.find((o: any) => o.id === userAnswerId)?.text || "No Answer";
            const correctAnswerText = q.options.find((o: any) => o.id === q.correctId)?.text;

            return (
              <View key={q.id} style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.questionNumCircle}>
                    <Text style={styles.questionNumText}>{q.id}</Text>
                  </View>
                  <Text style={styles.questionText}>{q.text}</Text>
                  <View style={styles.statusIconWrap}>
                    {isCorrect ? (
                      <View style={[styles.statusBadge, styles.statusBadgeCorrect]}>
                        <Check size={12} color="#10B981" strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, styles.statusBadgeWrong]}>
                        <X size={12} color="#EF4444" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.answerSection}>
                  {!isCorrect && (
                    <View style={styles.answerBlock}>
                      <Text style={styles.yourAnswerLabel}>YOUR ANSWER</Text>
                      <Text style={styles.yourAnswerText}>{userAnswerText}</Text>
                    </View>
                  )}
                  <View style={styles.answerBlock}>
                    <Text style={styles.correctLabel}>CORRECT ANSWER</Text>
                    <Text style={styles.correctText}>{correctAnswerText}</Text>
                  </View>
                </View>

                {q.explanation ? (
                  <View style={styles.explanationSection}>
                    <Text style={styles.explanationLabel}>EXPLANATION</Text>
                    <Text style={styles.explanationText}>{q.explanation}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            const parsedModuleId = parseInt(String(currentModuleId || ""), 10);
            if (!isNaN(parsedModuleId)) {
              queryClient.removeQueries({ queryKey: ["assessment-questions", parsedModuleId] });
            }
            router.replace(`/assessment/quiz?moduleId=${currentModuleId}`);
          }}
          style={styles.retakeBtn}
        >
          <RefreshCcw size={16} color="white" />
          <Text style={styles.retakeBtnText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/learn")}
          style={styles.continueBtn}
        >
          <CheckCircle size={16} color="white" />
          <Text style={styles.continueBtnText}>Continue Learning</Text>
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131C2E",
  },
  body: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  banner: {
    backgroundColor: "#131C2E",
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreCirclePassed: {
    borderColor: "#10B981",
    backgroundColor: "#14201A",
  },
  scoreCircleFailed: {
    borderColor: "#EF4444",
    backgroundColor: "#22191C",
  },
  percentText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 20,
    gap: 6,
  },
  badgePassed: {
    backgroundColor: "#14201A",
    borderColor: "#065F46",
  },
  badgeFailed: {
    backgroundColor: "#22191C",
    borderColor: "#7F1D1D",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  badgeTextPassed: {
    color: "#10B981",
  },
  badgeTextFailed: {
    color: "#EF4444",
  },
  assessmentTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 22,
    marginBottom: 6,
  },
  scoreSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionLabel: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  breakdownCard: {
    backgroundColor: "#131C2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E2D45",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  questionNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  questionNumText: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "700",
  },
  questionText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  statusIconWrap: {
    marginTop: 2,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  statusBadgeCorrect: {
    backgroundColor: "#14201A",
    borderColor: "#065F46",
  },
  statusBadgeWrong: {
    backgroundColor: "#22191C",
    borderColor: "#7F1D1D",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#1E2D45",
    marginVertical: 16,
  },
  answerSection: {
    gap: 14,
  },
  answerBlock: {
    gap: 4,
  },
  yourAnswerLabel: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  yourAnswerText: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 20,
  },
  correctLabel: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  correctText: {
    color: "#10B981",
    fontSize: 13,
    lineHeight: 20,
  },
  explanationSection: {
    backgroundColor: "#1C2538",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 4,
  },
  explanationLabel: {
    color: "#9CA3AF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  explanationText: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  retakeBtn: {
    backgroundColor: "#1E293B",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retakeBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  continueBtn: {
    flex: 1,
    backgroundColor: "#10B981",
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
    letterSpacing: 0.5,
    fontSize: 14,
  },
});
