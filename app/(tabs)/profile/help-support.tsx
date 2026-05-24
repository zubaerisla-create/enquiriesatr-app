import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AlertTriangle,
  ChevronRight
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { AnimatedPage } from "../../../components/ui";
import { getSupportContact } from "../../../lib/support";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ChatIcon = ({ size = 20, color = "#5B8DEF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.9l5.05-1.122A9.957 9.957 0 0012 22z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 12h8M8 9h8M8 15h5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
    />
  </Svg>
);

const EmailIcon = ({ size = 20, color = "#5B8DEF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6l-10 7L2 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ size = 20, color = "#5B8DEF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.05 2a9 9 0 017.95 7.95M14.05 6a5 5 0 013.95 3.95"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.8}
    />
  </Svg>
);

const ContactRow = ({
  item,
  isLast,
  onPress,
}: {
  item: {
    id: string;
    icon: (props: { size: number; color: string }) => React.JSX.Element;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    title: string;
    subtitle: string;
  };
  isLast: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center px-4 py-4 ${!isLast ? "border-b border-[#1E2D3D]" : ""
      }`}
  >
    <View
      style={{ backgroundColor: item.iconBg, borderColor: item.iconBorder }}
      className="w-10 h-10 rounded-xl items-center justify-center mr-3 border"
    >
      <item.icon size={18} color={item.iconColor} />
    </View>

    <View className="flex-1">
      <Text className="text-white font-semibold text-sm">{item.title}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">{item.subtitle}</Text>
    </View>

    <ChevronRight size={18} color="#4B5563" />
  </TouchableOpacity>
);

const FAQS = [
  { id: "1", question: "What is CPTAN and who is it for?" },
  { id: "2", question: "What does my subscription include?" },
  { id: "3", question: "How does the AI Assistant work?" },
  { id: "4", question: "Are my notes and documents stored securely?" },
  { id: "5", question: "Can I use CPTAN offline?" },
  { id: "6", question: "How do I cancel my subscription?" },
  {
    id: "7",
    question: "I'm a course instructor. Can I access CPTAN for my students?",
  },
];

const FaqRow = ({
  item,
  isLast,
}: {
  item: (typeof FAQS)[0];
  isLast: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      className={`px-4 py-4 ${!isLast ? "border-b border-[#1E2D3D]" : ""}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-sm flex-1 pr-3 leading-5">
          {item.question}
        </Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <ChevronRight size={18} color="#4B5563" />
        </View>
      </View>
      {open && (
        <Text className="text-gray-400 text-xs leading-5 mt-2">
          Tap to read the full answer to this question in the support documentation.
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function HelpSupport() {
  const [supportEmail, setSupportEmail] = useState("support@cptan.com");
  const [supportPhone, setSupportPhone] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchSupport() {
      try {
        const contact = await getSupportContact();
        if (active) {
          if (contact.email) {
            setSupportEmail(contact.email);
          }
          if (contact.phone) {
            setSupportPhone(contact.phone);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchSupport();

    return () => {
      active = false;
    };
  }, []);

  const contactOptions = [
    {
      id: "chat",
      icon: ChatIcon,
      iconBg: "#0C1F30",
      iconColor: "#38BDF8",
      iconBorder: "#1A3A54",
      title: "Live Chat",
      subtitle: "Average response time: 2 hours",
    },
    {
      id: "email",
      icon: EmailIcon,
      iconBg: "#1F1633",
      iconColor: "#C084FC",
      iconBorder: "#322252",
      title: "Email Support",
      subtitle: supportEmail,
    },
  ];

  if (supportPhone) {
    contactOptions.push({
      id: "phone",
      icon: PhoneIcon,
      iconBg: "#0A241A",
      iconColor: "#34D399",
      iconBorder: "#123C2B",
      title: "Phone Support",
      subtitle: supportPhone,
    });
  }

  return (
    <View className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />
      <AnimatedPage>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase px-4 mb-2 mt-4">
            Contact Support
          </Text>
          <View className="mx-4 mb-5 bg-[#141E2B] rounded-2xl overflow-hidden">
            {contactOptions.map((item, index) => (
              <ContactRow
                key={item.id}
                item={item}
                isLast={index === contactOptions.length - 1}
                onPress={() => {
                  if (item.id === "chat") {
                    router.push("/profile/live-chat");
                  } else if (item.id === "email") {
                    Linking.openURL(`mailto:${supportEmail}`);
                  } else if (item.id === "phone") {
                    Linking.openURL(`tel:${supportPhone}`);
                  }
                }}
              />
            ))}
          </View>

          <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase px-4 mb-2">
            Frequently Asked Questions
          </Text>
          <View className="mx-4 mb-5 bg-[#141E2B] rounded-2xl overflow-hidden">
            {FAQS.map((item, index) => (
              <FaqRow
                key={item.id}
                item={item}
                isLast={index === FAQS.length - 1}
              />
            ))}
          </View>

          <View className="mx-4 bg-[#1A0E0E] border border-[#3D1A1A] rounded-2xl px-4 py-4 flex-row items-start gap-3">
            <AlertTriangle size={20} color="#E05252" style={{ marginTop: 2, flexShrink: 0 }} />
            <Text className="text-gray-400 text-xs leading-5 flex-1">
              CPTAN is a training and operational reference tool. It does not replace formal SIA-accredited CP training, legal advice, or professional operational judgment. Always act within your training, competence, and the law.
            </Text>
          </View>
        </ScrollView>
      </AnimatedPage>
    </View>
  );
}