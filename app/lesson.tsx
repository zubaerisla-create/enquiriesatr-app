import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function LessonReadingView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const totalLessons = 5;

  // Completed state per lesson
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  // Save Note modal state
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savedNotes, setSavedNotes] = useState<{ lesson: number; text: string }[]>([]);

  const isFirst = currentLesson === 1;
  const isLast = currentLesson === totalLessons;
  const isCurrentCompleted = completedLessons.has(currentLesson);

  const handleNext = () => {
    if (!isLast) setCurrentLesson(prev => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentLesson(prev => prev - 1);
  };

  // Mark lesson as completed → advance to next or go back on last
  const handleComplete = () => {
    setCompletedLessons(prev => new Set(prev).add(currentLesson));
    if (isLast) {
      Alert.alert(
        "Module Complete! 🎉",
        "You've completed all lessons in this module. Ready for the assessment?",
        [
          { text: "Back to Module", onPress: () => router.back(), style: "cancel" },
          { text: "Take Assessment", onPress: () => router.push("/assessment/intro") },
        ]
      );
    } else {
      setCurrentLesson(prev => prev + 1);
    }
  };

  // Save note handler
  const handleSaveNote = () => {
    if (!noteText.trim()) {
      Alert.alert("Empty Note", "Please write something before saving.");
      return;
    }
    setSavedNotes(prev => [...prev, { lesson: currentLesson, text: noteText.trim() }]);
    setNoteText("");
    setNoteModalVisible(false);
    Alert.alert("Note Saved ✓", `Your note for Lesson ${currentLesson} has been saved.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Threat &amp; Risk Assessment</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="bookmark" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(currentLesson / totalLessons) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Breadcrumbs */}
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbBase}>CP Fundamentals</Text>
            <Feather name="chevron-right" size={10} color="#9ca3af" />
            <Text style={styles.breadcrumbActive}>Lesson {currentLesson}/{totalLessons}</Text>
          </View>

          {/* Title — mt-8 */}
          <Text style={styles.pageTitle}>THREAT &amp; RISK ASSESSMENT</Text>

          {/* Overview */}
          <Text style={styles.sectionHeading}>Overview</Text>
          <Text style={styles.bodyText}>
            Threat and risk assessment is a fundamental skill for any close protection operative. The ability to accurately identify, evaluate, and mitigate threats directly determines the safety of your principal.
          </Text>

          {/* The Threat Matrix */}
          <Text style={styles.sectionHeading}>The Threat Matrix</Text>
          <Text style={[styles.bodyText, { marginBottom: 20 }]}>
            A threat matrix categorises potential threats across two axes: likelihood and impact. By plotting threats on this matrix, operatives can prioritise protective measures and allocate resources effectively.
          </Text>

          {/* Bullet Points */}
          <View style={{ marginBottom: 32 }}>
            {[
              { title: "Intent", desc: "Does the threat actor want to cause harm?" },
              { title: "Capability", desc: "Do they have the means to act?" },
              { title: "Opportunity", desc: "Are the conditions present for an attack?" },
            ].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletDotWrap}>
                  <View style={styles.bulletDot} />
                </View>
                <Text style={styles.bulletBodyText}>
                  <Text style={styles.bulletTitle}>{item.title} — </Text>
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>

          {/* Conducting a Risk Assessment */}
          <Text style={styles.sectionHeading}>Conducting a Risk Assessment</Text>
          <Text style={[styles.bodyText, { marginBottom: 20 }]}>
            Every operation begins with a formal risk assessment. This structured evaluation identifies all foreseeable hazards and records appropriate control measures.
          </Text>

          {/* Numbered Steps */}
          <View style={{ marginBottom: 32 }}>
            {[
              "Identify the hazard or threat",
              "Determine who may be affected",
              "Evaluate the risk level (likelihood × severity)",
              "Implement control measures",
              "Review and update regularly",
            ].map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Key Principle */}
          <Text style={styles.sectionHeading}>Key Principle</Text>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              Complacency is the enemy of security. Threat levels change — your assessment must be a living document, reviewed at every stage of an operation.
            </Text>
          </View>

          {/* Prev / Next Nav */}
          <View style={styles.navRow}>
            <TouchableOpacity
              activeOpacity={isFirst ? 1 : 0.8}
              onPress={handlePrev}
              style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
            >
              <Feather name="chevron-left" size={16} color={isFirst ? "#9CA3AF" : "#1f2937"} />
              <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={isLast ? 1 : 0.8}
              onPress={handleNext}
              style={[styles.navBtn, isLast && styles.navBtnDisabled]}
            >
              <Text style={[styles.navBtnText, isLast && styles.navBtnTextDisabled]}>Next</Text>
              <Feather name="chevron-right" size={16} color={isLast ? "#9CA3AF" : "#1f2937"} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Sticky Footer */}
      <View style={styles.footer}>
        {/* Save Note */}
        <TouchableOpacity style={styles.footerSaveBtn} onPress={() => setNoteModalVisible(true)}>
          <Feather name="edit-2" size={16} color="#D82C15" style={{ marginRight: 8 }} />
          <Text style={styles.footerSaveBtnText}>Save Note</Text>
        </TouchableOpacity>

        {/* Completed / Mark Complete */}
        <TouchableOpacity
          style={[
            styles.footerActionBtn,
            { backgroundColor: isCurrentCompleted ? "#6B7280" : isLast ? "#D82C15" : "#2E8B57" },
          ]}
          onPress={isCurrentCompleted ? undefined : handleComplete}
          activeOpacity={isCurrentCompleted ? 1 : 0.8}
        >
          {!isLast && !isCurrentCompleted && (
            <Feather name="check-circle" size={16} color="white" style={{ marginRight: 8 }} />
          )}
          {isCurrentCompleted && (
            <Feather name="check" size={16} color="white" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.footerActionBtnText}>
            {isCurrentCompleted ? "Completed ✓" : isLast ? "MARK COMPLETE" : "Mark Complete"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Save Note Modal ── */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setNoteModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Save Note</Text>
                <Text style={styles.modalSubtitle}>Lesson {currentLesson} — Threat &amp; Risk Assessment</Text>
              </View>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Text Input */}
            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here..."
              placeholderTextColor="#9ca3af"
              multiline
              value={noteText}
              onChangeText={setNoteText}
              textAlignVertical="top"
              autoFocus
            />

            {/* Saved Notes Count */}
            {savedNotes.filter(n => n.lesson === currentLesson).length > 0 && (
              <Text style={styles.savedNotesHint}>
                {savedNotes.filter(n => n.lesson === currentLesson).length} note(s) already saved for this lesson
              </Text>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setNoteText(""); setNoteModalVisible(false); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveNote}>
                <Feather name="save" size={15} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.modalSaveText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.5)",
    backgroundColor: "#FAF8F5",
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 15,
  },
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#D82C15",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  breadcrumbBase: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: 10,
    textTransform: "uppercase",
  },
  breadcrumbActive: {
    color: "#D82C15",
    fontFamily: "monospace",
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  // ← mt-8 added here (marginTop: 32)
  pageTitle: {
    color: "#131C2E",
    fontSize: 24,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 32,
    marginBottom: 32,
  },
  sectionHeading: {
    color: "#131C2E",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 12,
  },
  bodyText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 32,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingRight: 16,
  },
  bulletDotWrap: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "rgba(252,165,165,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: "#D82C15",
  },
  bulletBodyText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 24,
    flex: 1,
  },
  bulletTitle: {
    fontWeight: "700",
    color: "#374151",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#D82C15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
  stepText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 24,
    flex: 1,
  },
  alertBox: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  alertText: {
    color: "#4B5563",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 8,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
  },
  navBtnDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.5,
  },
  navBtnText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#1f2937",
    marginHorizontal: 4,
  },
  navBtnTextDisabled: {
    color: "#9CA3AF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(229,231,235,0.6)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  footerSaveBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerSaveBtnText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 14,
  },
  footerActionBtn: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerActionBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#131C2E",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  modalCloseBtn: {
    padding: 4,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1f2937",
    minHeight: 120,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
  },
  savedNotesHint: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#D82C15",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});
