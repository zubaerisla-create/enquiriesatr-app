import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// ─── Reusable building blocks ─────────────────────────────────────────────────

/** Numbered section heading e.g. "01. OPERATIONAL USAGE" */
const SectionHeading = ({ number, title }: { number: string; title: string }) => (
  <View className="border-t border-[#1E2D3D] pt-4 mt-5 mb-3">
    <Text className="text-white font-extrabold text-sm tracking-wider uppercase">
      {number}. {title}
    </Text>
  </View>
);

/** Plain body paragraph */
const BodyText = ({ children }: { children: string }) => (
  <Text className="text-gray-400 text-xs leading-5 mb-3">{children}</Text>
);

/** Dark inset callout block with a bold label */
const InsetBlock = ({ label, body }: { label: string; body: string }) => (
  <View className="bg-[#141E2B] border-l-2 border-[#2A3D5E] rounded-r-xl px-4 py-3 mb-3">
    <Text className="text-white text-[10px] font-bold tracking-widest uppercase mb-1">
      {label}
    </Text>
    <Text className="text-gray-400 text-xs leading-5">{body}</Text>
  </View>
);

/** Red warning box */
const WarningBlock = ({ body }: { body: string }) => (
  <View className="bg-[#1A0E0E] border border-[#3D1A1A] rounded-xl px-4 py-3 mb-3">
    <Text className="text-[#E05252] text-[10px] font-bold leading-5 uppercase tracking-wide">
      {body}
    </Text>
  </View>
);

type TermBadgeColor = "red" | "blue" | "gray";

/** Subscription term row with coloured badge */
const TermRow = ({
  badge,
  badgeColor,
  body,
}: {
  badge: string;
  badgeColor: TermBadgeColor;
  body: string;
}) => {
  const bgMap: Record<TermBadgeColor, string> = {
    red:  "bg-[#E05252]",
    blue: "bg-[#5B8DEF]",
    gray: "bg-[#374151]",
  };

  return (
    <View className="flex-row items-start gap-3 mb-4">
      <View className={`${bgMap[badgeColor]} rounded px-2 py-0.5 mt-0.5`}>
        <Text className="text-white text-[9px] font-bold tracking-widest uppercase">
          {badge}
        </Text>
      </View>
      <Text className="text-gray-400 text-xs leading-5 flex-1">{body}</Text>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TermsAndConditions() {
  return (
    <SafeAreaView className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
      >
      

        {/* Page header */}
     
        <Text className="text-gray-500 text-sm mt-1 mb-2">
          Answers, guides, and contact options
        </Text>


        {/* ── 01. OPERATIONAL USAGE ── */}
        <SectionHeading number="01" title="Operational Usage" />
        <BodyText>
          The CPTAN application is engineered strictly for professional security personnel, tactical operators, and certified training organizations. Usage is contingent upon the user maintaining active credentials within their respective jurisdiction. Any deployment of CPTAN for unauthorized surveillance, non-professional activities, or outside regulated training environments is strictly prohibited.
        </BodyText>

        {/* ── 02. DATA PRIVACY & ENCRYPTION ── */}
        <SectionHeading number="02" title="Data Privacy & Encryption" />

        <InsetBlock
          label="Local-First Architecture"
          body="Operational data remains on-device. Local-first AI processing ensures sensitive intel never leaves your hardware encrypted perimeter."
        />

        <InsetBlock
          label="Zero-Cloud Storage"
          body="We do not provide cloud backups for mission-critical data. Users are responsible for their own secure physical redundancy protocols."
        />

        <BodyText>
          All transmissions within the CPTAN mesh network utilize AES-256 end-to-end encryption. Keys are generated and stored exclusively within the device's Secure Enclave.
        </BodyText>

        {/* ── 03. LIABILITY LIMITATIONS ── */}
        <SectionHeading number="03" title="Liability Limitations" />

        <WarningBlock body="Critical Warning: The CPTAN interface is a tactical reference tool. It does not replace professional field judgment, standard operating procedures (SOP), or primary military-grade communication channels." />

        <BodyText>
          The developers assume no liability for tactical errors, equipment failure, or data loss occurring during live operations. Users act on CPTAN outputs at their own professional risk.
        </BodyText>

        {/* ── 04. SUBSCRIPTION TERMS ── */}
        <SectionHeading number="04" title="Subscription Terms" />

        <TermRow
          badge="Term"
          badgeColor="red"
          body="Monthly or Annual recurring billing via secure tactical portal."
        />
        <TermRow
          badge="Trial"
          badgeColor="blue"
          body="7-day operational evaluation period provided for verified agencies."
        />
        <TermRow
          badge="Cancel"
          badgeColor="gray"
          body="Cancellation requires a 24-hour notice before the next billing cycle."
        />
      </ScrollView>
    </SafeAreaView>
  );
}