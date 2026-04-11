import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
  Check 
} from "lucide-react-native";

const ICON_MAP = {
  shield: Shield,
  "alert-triangle": AlertTriangle,
  users: Users,
  activity: Activity,
  camera: Camera,
  "alert-circle": AlertCircle,
  grid: Grid,
  "file-text": FileText,
};

// ─── Data ────────────────────────────────────────────────────────────────────

const SEVERITY_OPTS = ["Low", "Medium", "High", "Critical"];

const CATEGORIES = [
  {
    id: "access",
    icon: "shield",
    iconColor: "#4A90D9",
    iconBg: "#1E2D45",
    title: "Access & Entry Control",
    items: [
      "Number of entry points is clearly identified",
      "Number of exit points is clearly identified",
      "Entry and exit points are properly separated",
      "Security personnel are stationed at all access points",
      "Bag checks or screening procedures are in place",
      "Emergency exits are clearly marked and accessible",
    ],
  },
  {
    id: "risk",
    icon: "alert-triangle",
    iconColor: "#F5A623",
    iconBg: "#2A2010",
    title: "Risk Zone Identification",
    items: [
      "High-risk zones are clearly mapped",
      "Crowd density areas are identified",
      "Vulnerable locations are documented",
      "Restricted areas are clearly marked",
      "Escape routes from risk zones are planned",
    ],
  },
  {
    id: "crowd",
    icon: "users",
    iconColor: "#A855F7",
    iconBg: "#1E1230",
    title: "Crowd Management",
    items: [
      "Crowd capacity limits are defined",
      "Crowd flow routes are mapped",
      "Crowd control personnel are briefed",
      "Barrier placements are confirmed",
      "Communications with crowd control team established",
    ],
  },
  {
    id: "medical",
    icon: "activity",
    iconColor: "#EF4444",
    iconBg: "#2D1014",
    title: "Medical & Emergency Preparedness",
    items: [
      "Nearest A&E hospital is confirmed with timed route",
      "On-site medical personnel are confirmed",
      "First aid kits are accessible at key points",
      "Emergency contact numbers are distributed",
      "Evacuation plan for medical emergencies is briefed",
      "Principal's medical conditions and allergies documented",
    ],
  },
  {
    id: "surveillance",
    icon: "camera",
    iconColor: "#06B6D4",
    iconBg: "#0C2030",
    title: "Surveillance & Monitoring",
    items: [
      "CCTV coverage of all critical zones is confirmed",
      "Blind spots are identified and mitigated",
      "Surveillance monitoring post is staffed",
      "Communication between surveillance and ground team established",
    ],
  },
  {
    id: "threat",
    icon: "alert-circle",
    iconColor: "#D82C15",
    iconBg: "#2D1010",
    title: "Threat & Vulnerability Awareness",
    items: [
      "Known threats related to the principal are briefed",
      "Local threat intelligence has been reviewed",
      "Suspicious behaviour indicators are briefed",
      "Counter-surveillance measures are in place",
    ],
  },
  {
    id: "infrastructure",
    icon: "grid",
    iconColor: "#22C55E",
    iconBg: "#0C2010",
    title: "Infrastructure & Safety",
    items: [
      "Structural integrity of venue has been reviewed",
      "Power backup systems confirmed",
      "Fire suppression systems operational",
      "Safe rooms or rally points identified",
    ],
  },
  {
    id: "compliance",
    icon: "file-text",
    iconColor: "#8B5CF6",
    iconBg: "#1A1030",
    title: "Compliance & Documentation",
    items: [
      "All permits and licenses are confirmed and valid",
      "Risk assessment documentation completed and filed",
      "Operational orders distributed to team",
      "Post-event debrief scheduled",
    ],
  },
];

const TOTAL_ITEMS = CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);

// ─── Helper: get severity colours ────────────────────────────────────────────

const getSeverityColors = (sev: string | undefined) => {
  if (sev === "High" || sev === "Critical") return { border: "#D82C15", bg: "#2D1010", text: "#D82C15" };
  if (sev === "Medium") return { border: "#F5A623", bg: "#2A1E08", text: "#F5A623" };
  if (sev === "Low") return { border: "#22C55E", bg: "#0A1F0F", text: "#22C55E" };
  return { border: "#2D3748", bg: "transparent", text: "#6B7280" };
};

const getSeverityOptColor = (opt: string) => {
  if (opt === "Low") return "#22C55E";
  if (opt === "Medium") return "#F5A623";
  return "#D82C15";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThreatAssessmentChecklist() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ access: true });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [severity, setSeverity] = useState<Record<string, string>>({});
  const [sevDropdown, setSevDropdown] = useState<string | null>(null);

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progressPercent = Math.round((totalChecked / TOTAL_ITEMS) * 100);
  const canGenerate = progressPercent >= 75;

  const toggleCheck = (key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setSeverityFor = (key: string, val: string) => {
    setSeverity(prev => ({ ...prev, [key]: val }));
    setSevDropdown(null);
  };

  const catChecked = (cat: (typeof CATEGORIES)[0]) =>
    cat.items.filter((_, i) => checked[`${cat.id}_${i}`]).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Threat Assessment</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Text style={styles.subtitle}>
            Complete the checklist to generate an AI-powered risk report
          </Text>

          {/* Progress Row */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>{totalChecked}/{TOTAL_ITEMS} items</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progressPercent}% complete</Text>

          {/* Categories */}
          {CATEGORIES.map(cat => {
            const isOpen = expanded[cat.id];
            const done = catChecked(cat);
            const catPercent = Math.round((done / cat.items.length) * 100);
            const CatIcon = ICON_MAP[cat.icon as keyof typeof ICON_MAP];

            return (
              <View key={cat.id} style={styles.categoryWrap}>
                {/* Category Header */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(cat.id)}
                  style={styles.categoryHeader}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: cat.iconBg }]}>
                      <CatIcon size={18} color={cat.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Text style={styles.categoryCount}>{done}/{cat.items.length} completed</Text>
                    </View>
                  </View>
                  <View style={styles.categoryHeaderRight}>
                    <Text style={styles.categoryPercent}>{catPercent}%</Text>
                    {isOpen ? (
                      <ChevronUp size={16} color="#6B7280" />
                    ) : (
                      <ChevronDown size={16} color="#6B7280" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Items */}
                {isOpen && (
                  <View style={styles.itemsContainer}>
                    {cat.items.map((item, i) => {
                      const key = `${cat.id}_${i}`;
                      const isChecked = !!checked[key];
                      const sev = severity[key];
                      const showDrop = sevDropdown === key;
                      const sevColors = getSeverityColors(sev);

                      return (
                        <View key={key} style={styles.itemRow}>
                          <View style={styles.itemMain}>
                            {/* Checkbox + Text */}
                            <TouchableOpacity
                              onPress={() => toggleCheck(key)}
                              style={styles.itemCheckRow}
                            >
                              <View style={[
                                styles.checkbox,
                                isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
                              ]}>
                                {isChecked && <Check size={12} color="white" />}
                              </View>
                              <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                                {item}
                              </Text>
                            </TouchableOpacity>

                            {/* Severity Dropdown */}
                            <View style={styles.dropdownWrap}>
                              <TouchableOpacity
                                onPress={() => setSevDropdown(showDrop ? null : key)}
                                style={[
                                  styles.severityBtn,
                                  { borderColor: sevColors.border, backgroundColor: sevColors.bg },
                                ]}
                              >
                                <Text style={[styles.severityBtnText, { color: sevColors.text }]}>
                                  {sev || "Severity"}
                                </Text>
                                <ChevronDown size={10} color="#6B7280" />
                              </TouchableOpacity>

                              {showDrop && (
                                <View style={styles.dropdownMenu}>
                                  {SEVERITY_OPTS.map(opt => (
                                    <TouchableOpacity
                                      key={opt}
                                      onPress={() => setSeverityFor(key, opt)}
                                      style={styles.dropdownItem}
                                    >
                                      <Text style={[styles.dropdownItemText, { color: getSeverityOptColor(opt) }]}>
                                        {opt}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={canGenerate ? 0.8 : 1}
          onPress={() => canGenerate && router.push("/risk-report")}
          style={[styles.generateBtn, canGenerate ? styles.generateBtnActive : styles.generateBtnDisabled]}
        >
          <Text style={[styles.generateBtnText, !canGenerate && styles.generateBtnTextDisabled]}>
            {canGenerate
              ? "Generate AI Risk Report →"
              : `Complete ${75 - progressPercent}% more to generate report`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1520",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1E2D3D",
    backgroundColor: "#0D1520",
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: "#ffffff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  progressCount: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: "monospace",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#1E2D3D",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90D9",
    borderRadius: 4,
  },
  progressPercent: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "right",
    marginBottom: 24,
  },

  // Category
  categoryWrap: {
    marginBottom: 12,
  },
  categoryHeader: {
    backgroundColor: "#131C2E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryCount: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 2,
  },
  categoryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryPercent: {
    color: "#9ca3af",
    fontSize: 14,
    fontFamily: "monospace",
  },

  // Items
  itemsContainer: {
    backgroundColor: "#0F1824",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#1E2D3D",
    marginTop: -4,
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2D3D",
  },
  itemMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
  },
  checkboxUnchecked: {
    borderColor: "#2D3748",
    backgroundColor: "transparent",
  },
  itemText: {
    color: "#D1D5DB",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  itemTextChecked: {
    color: "#6b7280",
    textDecorationLine: "line-through",
  },

  // Severity
  dropdownWrap: {
    position: "relative",
  },
  severityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  severityBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: 32,
    zIndex: 50,
    backgroundColor: "#1A2535",
    borderWidth: 1,
    borderColor: "#2D3748",
    borderRadius: 12,
    overflow: "hidden",
    width: 96,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3748",
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#0D1520",
    borderTopWidth: 1,
    borderTopColor: "#1E2D3D",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  generateBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generateBtnActive: {
    backgroundColor: "#4A90D9",
  },
  generateBtnDisabled: {
    backgroundColor: "#1E2D3D",
  },
  generateBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#ffffff",
  },
  generateBtnTextDisabled: {
    color: "#6b7280",
  },
});
