import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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
  <View className="flex-row items-center gap-2 mb-1.5">
    <Check size={14} color={muted ? "#4B5563" : color} strokeWidth={3} />
    <Text className={`text-sm ${muted ? "text-gray-600" : "text-gray-300"}`}>
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
  const isTrial = !plan.interval || plan.amount === 0;

  const borderColor = isAnnual ? "#E05252" : isMonthly ? "#3B5FBF" : "#2D3748";
  const bgColor = isAnnual ? "#1A0A0A" : isMonthly ? "#131D30" : "#141E2B";
  const accentColor = isAnnual ? "#E05252" : isMonthly ? "#5B8DEF" : "#9CA3AF";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isCurrent}
      style={{ borderColor: selected ? accentColor : "#2D3748", backgroundColor: bgColor }}
      className={`mx-4 mb-3 rounded-2xl p-4 border-2 ${isCurrent ? "opacity-70" : ""}`}
    >
      {isAnnual && (
        <View className="absolute -top-3 right-4 bg-[#E05252] rounded-full px-3 py-0.5 flex-row items-center gap-1">
          <Star size={10} color="white" fill="white" />
          <Text className="text-white text-[10px] font-bold tracking-widest">RECOMMENDED</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-3 mt-1">
        <View className="flex-row items-center gap-2">
          <View
            style={{ borderColor: selected ? accentColor : "#3D4F62" }}
            className="w-5 h-5 rounded-full border-2 items-center justify-center"
          >
            {selected && (
              <View style={{ backgroundColor: accentColor }} className="w-2.5 h-2.5 rounded-full" />
            )}
          </View>
          <Text className="text-white font-extrabold text-base tracking-wider uppercase">
            {plan.plan_name}
          </Text>
          {isCurrent && (
            <View className="bg-green-600 rounded-full px-2 py-0.5">
              <Text className="text-white text-[10px] font-bold">CURRENT</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-end gap-0.5">
          <Text style={{ color: isAnnual ? "white" : accentColor }} className="font-extrabold text-xl">
            {(plan.currency || "GBP").toUpperCase()} {((plan.amount || 0) / 100).toFixed(2)}
          </Text>
          <Text className="text-gray-500 text-xs mb-0.5">/{plan.interval || "one-time"}</Text>
        </View>
      </View>

      {(plan.features || []).map((f, i) => (
        <CheckItem key={i} text={f} color={accentColor} muted={isTrial} />
      ))}

      {!isCurrent && (
        <View
          style={{ backgroundColor: isAnnual ? accentColor : "transparent", borderColor: isMonthly ? "#2A3D5E" : "transparent" }}
          className={`mt-4 rounded-xl py-3 items-center ${isMonthly ? "border" : ""}`}
        >
          <Text className={`${isAnnual ? "text-white" : "text-gray-400"} text-sm font-bold`}>
            Choose {plan.plan_name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function UpgradeAccess() {
  const queryClient = useQueryClient();
  const { subscribe, loading: paymentLoading } = useStripePayment();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

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
      <View className="flex-1 bg-[#0D1520] items-center justify-center">
        <ActivityIndicator size="large" color="#E05252" />
      </View>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <View className="flex-1 bg-[#0D1520] items-center justify-center px-8">
        <Text className="text-white text-center font-bold text-lg">No Plans Available</Text>
        <Text className="text-gray-500 text-center mt-2">Please check back later or contact support if this persists.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0D1520]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-4 mb-6 mt-4">
          <Text className="text-white font-bold text-2xl">Upgrade Access</Text>
          <Text className="text-gray-500 text-sm mt-2 leading-5">
            Full access to all 30 lessons, unlimited AI queries, and all operational tools.
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

        <Text className="text-gray-600 text-xs text-center px-8 mt-2 leading-5">
          Cancel anytime. Prices shown in {plans?.[0]?.currency.toUpperCase() || "GBP"} and may vary by region. Securely processed by Stripe.
        </Text>

        {mySub?.plan_slug && (
          <TouchableOpacity onPress={handleManage} className="mt-8 items-center">
            <Text className="text-[#5B8DEF] font-bold text-sm">Manage Current Subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-[#0D1520]">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={paymentLoading || !selectedPlan || (!!mySub?.plan_slug && mySub?.plan_slug === selectedPlan?.plan_slug)}
          className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${paymentLoading || (!!mySub?.plan_slug && mySub?.plan_slug === selectedPlan?.plan_slug) ? "bg-gray-700" : "bg-[#E05252]"
            }`}
        >
          {paymentLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Zap size={18} color="white" fill="white" />
              <Text className="text-white font-bold text-sm tracking-widest uppercase">
                {mySub?.plan_slug && mySub?.plan_slug === selectedPlan?.plan_slug
                  ? "Already Active"
                  : `Continue with ${selectedPlan?.plan_name}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}