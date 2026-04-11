import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { 
  Award, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCcw 
} from "lucide-react-native";
import { QUESTIONS } from "./quiz";

export default function AssessmentResults() {
  const { userAnswers } = useLocalSearchParams<{ userAnswers?: string }>();

  let answers: Record<number, string> = {};
  if (userAnswers) {
    try {
      answers = JSON.parse(userAnswers);
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate Score
  let score = 0;
  QUESTIONS.forEach(q => {
    if (answers[q.id] === q.correctId) score++;
  });

  const percent = Math.round((score / QUESTIONS.length) * 100);
  const passed = percent >= 70;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Banner */}
      <View style={styles.banner}>
        <Text style={styles.percentText}>{percent}%</Text>

        {/* Pass/Fail Badge */}
        <View style={[styles.badge, passed ? styles.badgePassed : styles.badgeFailed]}>
          {passed ? (
             <Award size={14} color="#34D399" />
          ) : (
             <AlertCircle size={14} color="#FCA5A5" />
          )}
          <Text style={[styles.badgeText, passed ? styles.badgeTextPassed : styles.badgeTextFailed]}>
            {passed ? "PASSED" : "FAILED"}
          </Text>
        </View>

        <Text style={styles.assessmentTitle}>Advance Work Assessment</Text>
        <Text style={styles.scoreSubtitle}>Pass mark: 70% · You scored {percent}%</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>QUESTION BREAKDOWN</Text>

          {QUESTIONS.map(q => {
            const userAnswerId = answers[q.id];
            const isCorrect = userAnswerId === q.correctId;
            const userAnswerText = q.options.find(o => o.id === userAnswerId)?.text || "No Answer";
            const correctAnswerText = q.options.find(o => o.id === q.correctId)?.text;

            return (
              <View key={q.id} style={styles.breakdownCard}>
                {/* Header row */}
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownLeft}>
                    <View style={styles.questionNumCircle}>
                      <Text style={styles.questionNumText}>{q.id}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.text}</Text>
                  </View>
                  <View style={{ marginTop: 4 }}>
                    {isCorrect ? (
                      <CheckCircle size={16} color="#34D399" />
                    ) : (
                      <XCircle size={16} color="#EF4444" />
                    )}
                  </View>
                </View>

                {/* Answer rows */}
                <View style={styles.answerSection}>
                  {!isCorrect && (
                    <View style={styles.answerRow}>
                      <Text style={styles.yourAnswerLabel}>YOUR ANSWER:</Text>
                      <Text style={styles.yourAnswerText}>{userAnswerText}</Text>
                    </View>
                  )}
                  <View style={styles.answerRow}>
                    <Text style={styles.correctLabel}>CORRECT:</Text>
                    <Text style={styles.correctText}>{correctAnswerText}</Text>
                  </View>
                </View>

                {/* Explanation */}
                <Text style={styles.explanationText}>{q.explanation}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.replace("/assessment/quiz")}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  banner: {
    backgroundColor: "#131C2E",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  percentText: {
    color: "#ffffff",
    fontSize: 80,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 80,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  badgePassed: {
    backgroundColor: "#065F46",
    borderColor: "#047857",
  },
  badgeFailed: {
    backgroundColor: "#7F1D1D",
    borderColor: "#991B1B",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  badgeTextPassed: {
    color: "#34D399",
  },
  badgeTextFailed: {
    color: "#FCA5A5",
  },
  assessmentTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  scoreSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
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
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  breakdownLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 16,
  },
  questionNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  questionNumText: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "700",
  },
  questionText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  answerSection: {
    marginLeft: 36,
    marginBottom: 16,
    gap: 12,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  yourAnswerLabel: {
    color: "#EF4444",
    fontSize: 10,
    width: 64,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  yourAnswerText: {
    color: "#D1D5DB",
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  correctLabel: {
    color: "#34D399",
    fontSize: 10,
    width: 64,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  correctText: {
    color: "#34D399",
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  explanationText: {
    color: "#9ca3af",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
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
