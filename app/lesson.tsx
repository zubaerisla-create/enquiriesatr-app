import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBottomSheet, AnimatedPage } from "../components/ui";
import Animated, { FadeIn } from "react-native-reanimated";
import { useBottomSheet } from "../hooks/useBottomSheet";
import { rf, rs } from "../utils/responsive";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle,
  ChevronRight,
  Edit2,
  Save,
  Lock
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { fetchModuleDetail, fetchModuleProgress, markModuleComplete } from "../lib/modules";
import { createNote } from "../lib/notes";
import { useAuth } from "../hooks/useAuth";


export default function LessonReadingView() {
  const { user } = useAuth();
  const { moduleId: moduleIdParam } = useLocalSearchParams();
  const moduleId = Number(moduleIdParam);

  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savedNotes, setSavedNotes] = useState<{ lesson: number; text: string }[]>([]);

  const {
    ref: noteSheetRef,
    present: presentNoteSheet,
    dismiss: dismissNoteSheet,
  } = useBottomSheet();

  useEffect(() => {
    const eventName = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const subscription = Keyboard.addListener(eventName, () => {
      noteSheetRef.current?.snapToIndex(0);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const queryClient = useQueryClient();

  const { data: moduleDetail, isLoading: moduleLoading } = useQuery({
    queryKey: ["module-detail", moduleId],
    queryFn: () => fetchModuleDetail(moduleId),
    enabled: !!moduleId,
  });

  const { data: progressData } = useQuery({
    queryKey: ["modules-progress"],
    queryFn: fetchModuleProgress,
  });

  const completeMutation = useMutation({
    mutationFn: () => markModuleComplete(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules-progress"] });
    }
  });

  const saveNoteMutation = useMutation({
    mutationFn: (content: string) => createNote({
      content,
      category: "lessons",
      referance: moduleDetail?.name,
      title: `Note for ${moduleDetail?.name}`
    }),
    onSuccess: () => {
      setNoteText("");
      dismissNoteSheet();
      Toast.show({
        type: "success",
        text1: "Note Saved ✓",
        text2: "Your note has been saved successfully.",
        position: "top",
        topOffset: 60,
      });
    }
  });

  if (moduleLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#D82C15" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  const hasActiveSub = user?.has_active_sub || false;
  const isLocked = moduleDetail && !moduleDetail.is_free && !hasActiveSub;

  if (isLocked) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0D1520" }]}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: rs(24) }}>
          <View style={{ width: rs(80), height: rs(80), borderRadius: rs(24), backgroundColor: "#2D1010", borderWidth: 1, borderColor: "#E05252", alignItems: "center", justifyContent: "center", marginBottom: rs(24) }}>
            <Lock size={32} color="#E05252" />
          </View>
          <Text style={{ fontSize: rf(24), fontWeight: "900", color: "#ffffff", textAlign: "center", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: rs(12) }}>
            Premium Content
          </Text>
          <Text style={{ fontSize: rf(14), color: "#9ca3af", textAlign: "center", lineHeight: rf(22), marginBottom: rs(36) }}>
            "{moduleDetail?.name}" is a premium close protection module. Upgrade to a premium subscription to gain immediate access to this lesson, practice tools, and safety assessments.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/profile/subscription-billing")}
            style={{
              width: "100%",
              backgroundColor: "#D82C15",
              paddingVertical: rs(16),
              borderRadius: rs(12),
              alignItems: "center",
              justifyContent: "center",
              marginBottom: rs(16),
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700", letterSpacing: 0.5, fontSize: rf(15) }}>UPGRADE NOW</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#9ca3af", fontWeight: "600", fontSize: rf(14) }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subsections = moduleDetail?.subsections || [];

  if (subsections.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Text style={{ fontSize: 16, color: "#4B5563", textAlign: "center" }}>No content available for this module.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#D82C15", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moduleProgress = (progressData || []).find(p => p.module === moduleId);
  const isCompleted = moduleProgress?.status === "completed";

  const handleMarkComplete = () => {
    completeMutation.mutate(undefined, {
      onSuccess: () => {
        setCompleteModalVisible(true);
      }
    });
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Note",
        text2: "Please write something before saving.",
      });
      return;
    }
    saveNoteMutation.mutate(noteText.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <AnimatedPage>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <ArrowLeft size={22} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{moduleDetail?.name}</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbBase}>{moduleDetail?.category}</Text>
              <ChevronRight size={10} color="#9ca3af" />
              <Text style={styles.breadcrumbActive}>{moduleDetail?.name}</Text>
            </View>

            {/* {moduleDetail?.use && (
              <Text style={styles.useText}>
                {moduleDetail.use}
              </Text>
            )} */}

            {moduleDetail?.topic && moduleDetail.topic.length > 0 && (
              <View style={{ marginBottom: rs(24) }}>
                <Text style={styles.sectionHeading}>Topics Covered</Text>
                {moduleDetail.topic.map((t, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDotWrap}>
                      <View style={styles.bulletDot} />
                    </View>
                    <Text style={styles.bulletBodyText}>
                      <Text style={styles.bulletTitle}>{t}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {subsections.map((sub, index) => {
              const paragraphs = sub.content.split(/\n\s*\n/);
              return (
                <View key={sub.id}>
                  <Text style={styles.sectionHeading}>
                    {index + 1}. {sub.name}
                  </Text>
                  {paragraphs.map((p, i) => (
                    <Text key={i} style={styles.bodyText}>
                      {p.trim()}
                    </Text>
                  ))}
                  {index < subsections.length - 1 && <View style={styles.sectionDivider} />}
                </View>
              );
            })}

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerSaveBtn} onPress={presentNoteSheet}>
            <Edit2 size={16} color="#D82C15" style={{ marginRight: 8 }} />
            <Text style={styles.footerSaveBtnText}>Save Note</Text>
          </TouchableOpacity>

          {isCompleted ? (
            <TouchableOpacity
              style={[styles.footerActionBtn, { backgroundColor: "#D82C15" }]}
              onPress={() => router.push(`/assessment/intro?moduleId=${moduleId}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.footerActionBtnText}>TAKE ASSESSMENT</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.footerActionBtn, { backgroundColor: "#D82C15" }]}
              onPress={handleMarkComplete}
              activeOpacity={0.8}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <CheckCircle size={16} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.footerActionBtnText}>MARK COMPLETE</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <AppBottomSheet
          ref={noteSheetRef}
          title="Save Note"
          subtitle={moduleDetail?.name}
          variant="light"
          enableDynamicSizing={false}
          snapPoints={["35%", "70%"]}
          keyboardBehavior="extend"
          onDismiss={() => setNoteText("")}
        >
          <BottomSheetTextInput
            style={styles.noteInput}
            placeholder="Write your note here..."
            placeholderTextColor="#9ca3af"
            multiline
            value={noteText}
            onChangeText={setNoteText}
            textAlignVertical="top"
          // autoFocus
          />

          {savedNotes.filter(n => n.lesson === moduleId).length > 0 && (
            <Text style={styles.savedNotesHint}>
              {savedNotes.filter(n => n.lesson === moduleId).length} note(s) already saved
            </Text>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => {
                setNoteText("");
                dismissNoteSheet();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSaveBtn, saveNoteMutation.isPending && { opacity: 0.7 }]}
              onPress={handleSaveNote}
              disabled={saveNoteMutation.isPending}
            >
              {saveNoteMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Save size={15} color="white" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSaveText}>Save Note</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </AppBottomSheet>

        <Modal
          visible={completeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCompleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setCompleteModalVisible(false)}
            />
            <View style={styles.completeModalContent}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Check size={32} color="#4CAF50" strokeWidth={3} />
                </View>
              </View>

              <Text style={styles.completeTitle}>Module Complete!</Text>
              <Text style={styles.completeSubtitle}>
                You've successfully finished "{moduleDetail?.name}".
              </Text>

              <TouchableOpacity
                style={styles.completeAssessmentBtn}
                onPress={() => {
                  setCompleteModalVisible(false);
                  router.replace(`/assessment/intro?moduleId=${moduleId}`);
                }}
              >
                <Text style={styles.completeAssessmentBtnText}>Take Assessment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.completeDoneBtn}
                onPress={() => {
                  setCompleteModalVisible(false);
                  router.back();
                }}
              >
                <Text style={styles.completeDoneBtnText}>Back to Modules</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </AnimatedPage>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },
  header: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(4),
    paddingBottom: rs(16),
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.5)",
    backgroundColor: "#FAF8F5",
  },
  headerBtn: {
    padding: rs(8),
  },
  headerTitle: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: rf(15),
  },
  progressTrack: {
    height: rs(2),
    width: "100%",
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#D82C15",
  },
  content: {
    paddingHorizontal: rs(24),
    paddingTop: rs(24),
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
    marginBottom: rs(8),
  },
  breadcrumbBase: {
    color: "#9ca3af",
    fontFamily: "monospace",
    fontSize: rf(10),
    textTransform: "uppercase",
  },
  breadcrumbActive: {
    color: "#D82C15",
    fontFamily: "monospace",
    fontSize: rf(10),
    textTransform: "uppercase",
    fontWeight: "700",
  },
  useText: {
    color: "#131C2E",
    fontWeight: "900",
    fontSize: rf(20),
    marginTop: rs(10),
    marginBottom: rs(12),
  },
  pageTitle: {
    color: "#131C2E",
    fontSize: rf(24),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: rs(32),
    marginBottom: rs(32),
  },
  sectionHeading: {
    color: "#131C2E",
    fontWeight: "900",
    fontSize: rf(16),
    marginTop: rs(8),
    marginBottom: rs(12),
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: rs(16),
  },
  bodyText: {
    color: "#4B5563",
    fontSize: rf(14),
    lineHeight: rf(24),
    marginBottom: rs(8),
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: rs(12),
    paddingRight: rs(16),
  },
  bulletDotWrap: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(4),
    backgroundColor: "rgba(252,165,165,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rs(12),
    marginTop: rs(2),
  },
  bulletDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(2),
    backgroundColor: "#D82C15",
  },
  bulletBodyText: {
    color: "#4B5563",
    fontSize: rf(14),
    lineHeight: rf(24),
    flex: 1,
  },
  bulletTitle: {
    fontWeight: "700",
    color: "#374151",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(12),
  },
  stepNumber: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(6),
    backgroundColor: "#D82C15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rs(12),
  },
  stepNumberText: {
    color: "white",
    fontWeight: "700",
    fontSize: rf(12),
  },
  stepText: {
    color: "#4B5563",
    fontSize: rf(14),
    lineHeight: rf(24),
    flex: 1,
  },
  alertBox: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(32),
  },
  alertText: {
    color: "#4B5563",
    fontSize: rf(12),
    fontStyle: "italic",
    lineHeight: rf(20),
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rs(16),
    marginTop: rs(8),
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rs(12),
    paddingVertical: rs(12),
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
    fontSize: rf(14),
    color: "#1f2937",
    marginHorizontal: rs(4),
  },
  navBtnTextDisabled: {
    color: "#9CA3AF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(229,231,235,0.6)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rs(12),
  },
  footerSaveBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: rs(20),
    paddingVertical: rs(14),
    borderRadius: rs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerSaveBtnText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: rf(14),
  },
  footerActionBtn: {
    flex: 1,
    paddingHorizontal: rs(20),
    paddingVertical: rs(14),
    borderRadius: rs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerActionBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: rf(14),
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: rs(16),
  },

  modalTitle: {
    fontSize: rf(18),
    fontWeight: "700",
    color: "#131C2E",
    marginBottom: rs(4),
  },
  modalSubtitle: {
    fontSize: rf(12),
    color: "#9ca3af",
  },
  modalCloseBtn: {
    padding: rs(4),
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: rs(12),
    padding: rs(16),
    fontSize: rf(14),
    color: "#1f2937",
    minHeight: rs(120),
    backgroundColor: "#FAFAFA",
    marginBottom: rs(8),
  },
  savedNotesHint: {
    fontSize: rf(11),
    color: "#6b7280",
    marginBottom: rs(16),
  },
  modalActions: {
    flexDirection: "row",
    gap: rs(12),
    marginTop: rs(12),
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: rs(14),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: rf(14),
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: rs(14),
    borderRadius: rs(12),
    backgroundColor: "#D82C15",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    color: "white",
    fontWeight: "700",
    fontSize: rf(14),
  },
  completeModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: rs(24),
    paddingHorizontal: rs(24),
    paddingVertical: rs(40),
    alignItems: "center",
    width: "85%",
    alignSelf: "center",
    marginBottom: "auto",
    marginTop: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  successIconOuter: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(24),
  },
  successIconInner: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    borderWidth: 3,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  completeTitle: {
    fontSize: rf(22),
    fontWeight: "900",
    color: "#131C2E",
    marginBottom: rs(8),
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  completeSubtitle: {
    fontSize: rf(14),
    color: "#6b7280",
    textAlign: "center",
    marginBottom: rs(32),
    lineHeight: rf(20),
  },
  completeAssessmentBtn: {
    width: "100%",
    backgroundColor: "#D82C15",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
    justifyContent: "center",
  },
  completeAssessmentBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: rf(15),
  },
  completeDoneBtn: {
    width: "100%",
    backgroundColor: "#131C2E",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
    justifyContent: "center",
    marginTop: rs(12),
  },
  completeDoneBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: rf(15),
  },
  noteModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    paddingHorizontal: rs(20),
    paddingTop: rs(12),
    paddingBottom: rs(36),
    width: "100%",
  },
});

