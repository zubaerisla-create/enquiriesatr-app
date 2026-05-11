import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { 
  X, 
  Check, 
  ChevronRight 
} from "lucide-react-native";

export const QUESTIONS = [
  {
    id: 1,
    text: "What is the correct sequence for the advance process?",
    options: [
      { id: "A", text: "Travel to location → Assess → Report → Brief" },
      { id: "B", text: "Plan → Recce → Assess → Report → Brief team → Execute" },
      { id: "C", text: "Brief team → Travel → Assess → Report" },
      { id: "D", text: "Recce → Plan → Execute → Brief" },
    ],
    correctId: "B",
    explanation: "The advance process follows a logical sequence: Plan, conduct Recce, Assess findings, produce a Report, Brief the team, then Execute.",
  },
  {
    id: 2,
    text: "What must always be included in a medical advance regardless of location?",
    options: [
      { id: "A", text: "A local doctor's contact number only" },
      { id: "B", text: "The nearest A&E hospital with timed route and contact details" },
      { id: "C", text: "A list of local pharmacies" },
      { id: "D", text: "A fully equipped trauma surgeon on standby" },
    ],
    correctId: "B",
    explanation: "Every advance must include the nearest Emergency Department with a timed route. Medical emergencies can happen on any assignment.",
  },
  {
    id: 3,
    text: "When conducting a route recce, what is the purpose of timing each route?",
    options: [
      { id: "A", text: "To race other drivers" },
      { id: "B", text: "To establish accurate ETAs and identify the fastest emergency extraction route" },
      { id: "C", text: "To practice driving skills" },
      { id: "D", text: "To ensure the principal gets to listen to a specific radio show" },
    ],
    correctId: "B",
    explanation: "Accurate route timing enables precise ETAs for the principal and identifies the fastest route in an emergency — critical information for the team.",
  },
  {
    id: 4,
    text: "For international operations, what document should the advance team produce before the principal travels?",
    options: [
      { id: "A", text: "A tourist guide" },
      { id: "B", text: "A packing list" },
      { id: "C", text: "A comprehensive advance report covering venues, routes, hospitals, local threats, and emergency contacts" },
      { id: "D", text: "A dinner menu" },
    ],
    correctId: "C",
    explanation: "A comprehensive advance report is essential for international operations — it becomes the team's operational bible for the visit.",
  },
  {
    id: 5,
    text: "What is a 'hard stop' in route planning?",
    options: [
      { id: "A", text: "A pre-identified emergency stopping point with a specific action plan" },
      { id: "B", text: "A traffic light" },
      { id: "C", text: "A stop sign" },
      { id: "D", text: "When the car runs out of gas" },
    ],
    correctId: "A",
    explanation: "A hard stop is a pre-planned emergency stopping point where specific tactical actions are pre-assigned — used if the route is compromised.",
  },
];

export default function AssessmentQuiz() {
  const [currIdx, setCurrIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = QUESTIONS[currIdx];
  const isAnswered = selectedOption !== null;

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = () => {
    if (currIdx < QUESTIONS.length - 1) {
      setCurrIdx(currIdx + 1);
      setSelectedOption(null);
    } else {
      router.replace({
        pathname: "/assessment/results",
        params: { userAnswers: JSON.stringify(answers) },
      });
    }
  };

  const getCardStyle = (optionId: string) => {
    if (!isAnswered) return styles.cardDefault;
    if (optionId === question.correctId) return styles.cardCorrect;
    if (optionId === selectedOption) return styles.cardWrong;
    return styles.cardDefault;
  };

  const getLetterStyle = (optionId: string) => {
    if (!isAnswered) return styles.letterDefault;
    if (optionId === question.correctId) return styles.letterCorrect;
    if (optionId === selectedOption) return styles.letterWrong;
    return styles.letterDefault;
  };

  const getOptionTextColor = (optionId: string) => {
    if (isAnswered && (optionId === question.correctId || optionId === selectedOption)) {
      return "#1f2937";
    }
    return "#ffffff";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Header Strip */}
      <View style={styles.headerStrip}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>
          <Text style={styles.questionCounter}>
            {currIdx + 1} / {QUESTIONS.length}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(currIdx / QUESTIONS.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.questionLabel}>QUESTION {question.id}</Text>
          <Text style={styles.questionText}>{question.text}</Text>

          {/* Options */}
          {question.options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(opt.id)}
              style={[styles.optionCard, getCardStyle(opt.id)]}
            >
              <View style={[styles.optionLetter, getLetterStyle(opt.id)]}>
                <Text style={[styles.optionLetterText, isAnswered && (opt.id === question.correctId || opt.id === selectedOption) ? { color: "#ffffff" } : {}]}>
                  {opt.id}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: getOptionTextColor(opt.id) }]}>
                {opt.text}
              </Text>
              {isAnswered && opt.id === question.correctId && (
                <View style={styles.feedbackIcon}>
                  <Check size={12} color="white" strokeWidth={3} />
                </View>
              )}
              {isAnswered && opt.id === selectedOption && opt.id !== question.correctId && (
                <View style={[styles.feedbackIcon, { backgroundColor: "#EF4444" }]}>
                  <X size={12} color="white" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Feedback Box */}
          {isAnswered && (
            <View style={[
              styles.feedbackBox,
              selectedOption === question.correctId ? styles.feedbackBoxCorrect : styles.feedbackBoxWrong,
            ]}>
              <Text style={[
                styles.feedbackTitle,
                selectedOption === question.correctId ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong,
              ]}>
                {selectedOption === question.correctId ? "✓ Correct" : "✕ Incorrect"}
              </Text>
              <Text style={styles.feedbackBodyText}>{question.explanation}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isAnswered && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>
              {currIdx < QUESTIONS.length - 1 ? "NEXT QUESTION" : "SEE RESULTS"}
            </Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerStrip: {
    backgroundColor: "#131C2E",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  closeBtn: {
    padding: 4,
  },
  questionCounter: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: 14,
    letterSpacing: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#2D3748",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#D82C15",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  questionLabel: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  questionText: {
    color: "#131C2E",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
    borderRadius: 16,
  },
  cardDefault: {
    backgroundColor: "#131C2E",
  },
  cardCorrect: {
    backgroundColor: "#F4F9F6",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  cardWrong: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  letterDefault: {
    backgroundColor: "#1E293B",
  },
  letterCorrect: {
    backgroundColor: "#22C55E",
  },
  letterWrong: {
    backgroundColor: "#EF4444",
  },
  optionLetterText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#9ca3af",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  feedbackIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  feedbackBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  feedbackBoxCorrect: {
    backgroundColor: "#F4F9F6",
    borderColor: "#A7F3D0",
  },
  feedbackBoxWrong: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FECACA",
  },
  feedbackTitle: {
    fontWeight: "700",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    fontSize: 14,
  },
  feedbackTitleCorrect: {
    color: "#059669",
    borderBottomColor: "#A7F3D0",
  },
  feedbackTitleWrong: {
    color: "#DC2626",
    borderBottomColor: "#FECACA",
  },
  feedbackBodyText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  nextBtn: {
    width: "100%",
    backgroundColor: "#D82C15",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: {
    color: "white",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 14,
  },
});
