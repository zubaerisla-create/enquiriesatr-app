import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import {
  Check,
  Star,
  Zap,
  ArrowLeft,
  Trophy,
  Rocket,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useStripePayment } from "../../../hooks/useStripePayment";
import { useAuth } from "../../../hooks/useAuth";

interface Plan {
  plan_name: string;
  plan_slug: string;
  amount: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
}

interface MySubscription {
  plan_name?: string;
  plan_slug?: string;
  status?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

const CheckItem = ({
  text,
  muted,
  color = "#4CAF82",
}: {
  text: string;
  muted?: boolean;
  color?: string;
}) => (
  <View className="flex-row items-center gap-3 mb-2">
    <View
      style={{ backgroundColor: muted ? "#1F2937" : `${color}15` }}
      className="w-5 h-5 rounded-full items-center justify-center"
    >
      <Check size={12} color={muted ? "#4B5563" : color} strokeWidth={4} />
    </View>
    <Text className={`text-sm ${muted ? "text-gray-600" : "text-gray-200"}`}>
      {text}
    </Text>
  </View>
);

const PlanCard = ({
  plan,
  selected,
  onPress,
  isCurrent
}: {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
  isCurrent?: boolean;
}) => {
  const isAnnual = plan.interval === "year";
  const isMonthly = plan.interval === "month";

  const accentColor = isAnnual ? "#E05252" : isMonthly ? "#3B82F6" : "#9CA3AF";
  const bgColor = selected ? "#1A2433" : "#111827";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isCurrent}
      activeOpacity={0.8}
      style={{
        borderColor: selected ? accentColor : "#1F2937",
        backgroundColor: bgColor,
        borderWidth: 2
      }}
      className={`mx-4 mb-4 rounded-3xl p-5 shadow-sm ${isCurrent ? "opacity-60" : ""}`}
    >
      {isAnnual && (
        <View className="absolute -top-3 right-6 bg-[#E05252] rounded-full px-4 py-1 shadow-lg">
          <Text className="text-white text-[10px] font-black tracking-widest uppercase">Best Value</Text>
        </View>
      )}

      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">
            {plan.interval === 'year' ? 'Annual Plan' : 'Monthly Plan'}
          </Text>
          <Text className="text-white font-black text-xl tracking-tight">
            {plan.plan_name}
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-baseline">
            <Text className="text-white font-black text-2xl tracking-tighter">
              {(plan.currency || "GBP").toUpperCase()} {((plan.amount || 0) / 100).toFixed(2)}
            </Text>
          </View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            Per {plan.interval}
          </Text>
        </View>
      </View>

      <View className="space-y-1">
        {(plan.features || []).map((f, i) => (
          <CheckItem key={i} text={f} color={accentColor} />
        ))}
      </View>

      <View className="mt-4 pt-4 border-t border-gray-800/50 flex-row items-center justify-between">
        <Text className="text-gray-500 text-[10px] font-medium italic">
          {isAnnual ? "Billed annually. Secure checkout." : "Cancel anytime. Billed monthly."}
        </Text>
        {selected && !isCurrent && (
          <View style={{ backgroundColor: accentColor }} className="rounded-full p-1">
            <Check size={12} color="white" strokeWidth={4} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SuccessOverlay = ({
  visible,
  planName,
  onClose
}: {
  visible: boolean;
  planName: string;
  onClose: () => void
}) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View className="flex-1 bg-[#030712] items-center justify-center px-8">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-[#22C55E] rounded-full items-center justify-center mb-6 shadow-2xl">
          <Trophy size={48} color="white" />
        </View>
        <Text className="text-white font-black text-4xl text-center tracking-tighter">
          You're All Set!
        </Text>
        <Text className="text-gray-400 text-lg text-center mt-3 font-medium">
          Welcome to the Premium experience.
        </Text>
      </View>

      <View className="w-full mb-12">
        <View className="flex-row items-center gap-4 bg-[#111827] p-5 rounded-2xl mb-4">
          <Zap size={22} color="#E05252" fill="#E05252" />
          <Text className="text-gray-200 font-bold text-base">Unlimited AI Features Unlocked</Text>
        </View>
        <View className="flex-row items-center gap-4 bg-[#111827] p-5 rounded-2xl">
          <Rocket size={22} color="#E05252" />
          <Text className="text-gray-200 font-bold text-base">Full Lesson Library Access</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onClose}
        className="bg-white w-full py-5 rounded-2xl items-center shadow-lg"
      >
        <Text className="text-black font-black text-lg tracking-tight">Start Exploring</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

export default function UpgradeAccess() {
  const queryClient = useQueryClient();
  const { subscribe, loading: paymentLoading } = useStripePayment();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await api.get<Plan[]>("/subscriptions/plans/", { requireAuth: true });
      return response.data;
    },
  });

  const { data: mySub, isLoading: mySubLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const response = await api.get<MySubscription>("/subscriptions/plan/me/", { requireAuth: true });
      return response.data;
    },
  });

  const selectedPlan = useMemo(() => {
    if (!plans) return null;
    if (selectedSlug) return plans.find(p => p.plan_slug === selectedSlug);
    return plans.find(p => p.interval === "year") || plans[0];
  }, [plans, selectedSlug]);

  const { refreshUser } = useAuth();

  const handleContinue = async () => {
    if (!selectedPlan) return;

    if (mySub?.plan_slug && mySub?.plan_slug === selectedPlan.plan_slug) {
      Alert.alert("Already Subscribed", "You are already on this plan.");
      return;
    }

    await subscribe(selectedPlan.plan_slug, async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      await refreshUser();
      setShowSuccess(true);
    });
  };

  const handleManage = async () => {
    try {
      const response = await api.post<{ url: string }>(
        "/subscriptions/portal/",
        {},
        { requireAuth: true }
      );
      const { url } = response.data;
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      Alert.alert("Error", "Could not open billing portal.");
    }
  };

  if (plansLoading || mySubLoading) {
    return (
      <View className="flex-1 bg-[#030712] items-center justify-center">
        <ActivityIndicator size="large" color="#E05252" />
      </View>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <View className="flex-1 bg-[#030712] items-center justify-center px-8">
        <Text className="text-white text-center font-bold text-lg">No Plans Available</Text>
        <Text className="text-gray-500 text-center mt-2">Please check back later.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#030712]">
      <StatusBar style="light" />

      <SuccessOverlay
        visible={showSuccess}
        planName={selectedPlan?.plan_name || "Premium"}
        onClose={() => {
          setShowSuccess(false);
          router.replace("/(tabs)/profile");
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className="px-6 mb-8 mt-6">
          <Text className="text-white font-black text-3xl tracking-tight">Level Up Your App</Text>
          <Text className="text-gray-400 text-sm mt-3 leading-6 font-medium">
            Unlock premium features, unlimited AI access, and priority operational support to accelerate your development.
          </Text>
        </View>

        {plans?.map((plan) => (
          <PlanCard
            key={plan.plan_slug}
            plan={plan}
            selected={selectedPlan?.plan_slug === plan.plan_slug}
            isCurrent={mySub?.plan_slug === plan.plan_slug}
            onPress={() => setSelectedSlug(plan.plan_slug)}
          />
        ))}

        <View className="px-10 mt-4">
          <Text className="text-gray-600 text-[10px] font-bold text-center leading-4 uppercase tracking-widest">
            Secured by Stripe • End-to-end Encrypted • Cancel Anytime
          </Text>
        </View>

        {mySub?.plan_slug && (
          <TouchableOpacity
            onPress={handleManage}
            className="mt-10 mx-6 py-4 rounded-2xl border border-gray-800 items-center bg-[#111827]"
          >
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Manage Billing & Invoices</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-6 bg-[#030712]/90 border-t border-gray-900">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={paymentLoading || !selectedPlan || (!!mySub?.plan_slug && mySub?.plan_slug === selectedPlan?.plan_slug)}
          className={`rounded-2xl py-5 flex-row items-center justify-center shadow-2xl ${paymentLoading || (!!mySub?.plan_slug && mySub?.plan_slug === selectedPlan?.plan_slug)
            ? "bg-gray-800"
            : "bg-[#E05252]"
            }`}
        >
          {paymentLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center gap-3">
              <Zap size={20} color="white" fill="white" />
              <Text className="text-white font-black text-base tracking-tight">
                {mySub?.plan_slug && mySub?.plan_slug === selectedPlan?.plan_slug
                  ? "Current Plan Active"
                  : `Get ${selectedPlan?.plan_name} Now`}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {!mySub?.plan_slug && (
          <Text className="text-gray-500 text-[9px] text-center mt-3 font-bold uppercase tracking-widest">
            Automatic renewal until cancelled in settings.
          </Text>
        )}
      </View>
    </View>
  );
}