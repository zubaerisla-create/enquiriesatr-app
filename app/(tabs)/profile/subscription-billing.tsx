import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { AppBottomSheet } from "../../../components/ui";
import { useBottomSheet } from "../../../hooks/useBottomSheet";
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
  const isTrial = plan.plan_slug === "trial";

  const accentColor = isAnnual ? "#E05252" : isMonthly ? "#3B82F6" : "#10B981";
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
      className={`mx-4 mb-4 rounded-3xl p-5 shadow-sm ${isCurrent ? "opacity-95" : ""}`}
    >
      {isAnnual && !isCurrent && (
        <View className="absolute -top-3 right-6 bg-[#E05252] rounded-full px-4 py-1 shadow-lg">
          <Text className="text-white text-[10px] font-black tracking-widest uppercase">Best Value</Text>
        </View>
      )}

      {isCurrent && (
        <View className="absolute -top-3 right-6 bg-[#10B981] rounded-full px-4 py-1 shadow-lg">
          <Text className="text-white text-[10px] font-black tracking-widest uppercase">Current Plan</Text>
        </View>
      )}

      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">
            {isTrial ? 'Trial Tier' : isAnnual ? 'Annual Plan' : 'Monthly Plan'}
          </Text>
          <Text className="text-white font-black text-xl tracking-tight">
            {plan.plan_name}
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-baseline">
            <Text className="text-white font-black text-2xl tracking-tighter">
              {plan.amount === 0 ? "Free" : `${(plan.currency || "GBP").toUpperCase()} ${((plan.amount || 0) / 100).toFixed(2)}`}
            </Text>
          </View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            {plan.amount === 0 ? "14 Days" : `Per ${plan.interval}`}
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
          {isTrial ? "No credit card required." : isAnnual ? "Billed annually. Secure checkout." : "Cancel anytime. Billed monthly."}
        </Text>
        {selected && (
          <View style={{ backgroundColor: accentColor }} className="rounded-full p-1">
            <Check size={12} color="white" strokeWidth={4} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function UpgradeAccess() {
  const queryClient = useQueryClient();
  const { subscribe, loading: paymentLoading } = useStripePayment();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const {
    ref: changePlanRef,
    present: presentChangePlan,
    dismiss: dismissChangePlan,
  } = useBottomSheet();
  const [modalSelectedSlug, setModalSelectedSlug] = useState<string | null>(null);

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleSuccessClose = useCallback(() => {
    setSuccessModalVisible(false);
    router.replace("/(tabs)/profile");
  }, []);

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

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    const currentSlug = mySub?.plan_slug;
    return plans.filter(
      (p) => p.plan_slug !== "trial" && (!currentSlug || p.plan_slug !== currentSlug)
    );
  }, [plans, mySub]);

  const selectedPlan = useMemo(() => {
    if (!filteredPlans || filteredPlans.length === 0) return null;
    if (selectedSlug) return filteredPlans.find((p) => p.plan_slug === selectedSlug) || null;
    const currentSlug = mySub?.plan_slug;
    if (currentSlug) {
      if (currentSlug === "trial") {
        return filteredPlans.find((p) => p.interval === "year") || filteredPlans.find((p) => p.interval === "month") || filteredPlans[0];
      }
      return null;
    }
    return filteredPlans.find((p) => p.interval === "year") || filteredPlans[0];
  }, [filteredPlans, selectedSlug, mySub]);

  const { refreshUser } = useAuth();

  const handleContinue = async () => {
    if (!selectedPlan) return;

    if (mySub?.plan_slug && mySub?.plan_slug === selectedPlan.plan_slug) {
      Alert.alert("Already Subscribed", "You are already on this plan.");
      return;
    }

    if (mySub?.plan_slug && mySub?.plan_slug !== "trial" && selectedPlan.plan_slug !== mySub.plan_slug) {
      await handleManage();
      return;
    }

    await subscribe(selectedPlan.plan_slug, async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      await refreshUser();
      setSuccessModalVisible(true);
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

  const handleConfirmChange = async () => {
    if (!modalSelectedSlug) return;
    dismissChangePlan();
    await handleManage();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const buttonText = useMemo(() => {
    if (!selectedPlan) return "Select a Plan";
    if (mySub?.plan_slug === selectedPlan.plan_slug) {
      return "Current Plan Active";
    }
    if (mySub?.plan_slug === "trial" && selectedPlan.plan_slug !== "trial") {
      return `Upgrade to ${selectedPlan.plan_name}`;
    }
    if (mySub?.plan_slug && mySub?.plan_slug !== "trial" && selectedPlan.plan_slug !== mySub.plan_slug) {
      return "Change Plan via Portal";
    }
    return `Get ${selectedPlan.plan_name} Now`;
  }, [mySub, selectedPlan]);

  const isButtonDisabled = useMemo(() => {
    if (paymentLoading) return true;
    if (!selectedPlan) return true;
    if (mySub?.plan_slug === selectedPlan.plan_slug) return true;
    return false;
  }, [paymentLoading, selectedPlan, mySub]);

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

      <Modal
        visible={successModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleSuccessClose}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="absolute inset-0 bg-black/60"
            activeOpacity={1}
            onPress={handleSuccessClose}
          />
          <View className="bg-[#030712] rounded-t-[40px] px-6 pt-8 pb-12 border-t border-gray-900 shadow-2xl items-center w-full z-50">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-[#22C55E] rounded-full items-center justify-center mb-5 shadow-2xl">
                <Trophy size={40} color="white" />
              </View>
              <Text className="text-white font-black text-3xl text-center tracking-tighter">
                You're All Set!
              </Text>
              <Text className="text-gray-400 text-base text-center mt-2 font-medium">
                Welcome to the Premium experience.
              </Text>
            </View>

            <View className="w-full mb-8">
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
              onPress={handleSuccessClose}
              className="bg-white w-full py-5 rounded-2xl items-center shadow-lg"
            >
              <Text className="text-black font-black text-lg tracking-tight">Start Exploring</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AppBottomSheet
        ref={changePlanRef}
        title="Change Your Plan"
        subtitle="Select a new subscription tier below."
        variant="dark"
        enableDynamicSizing={false}
        snapPoints={["45%"]}
      >
        <BottomSheetScrollView
          className="flex-1 mb-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
        >
          {filteredPlans.map((plan) => {
            const isSelected = modalSelectedSlug === plan.plan_slug;
            return (
              <PlanCard
                key={plan.plan_slug}
                plan={plan}
                selected={isSelected}
                onPress={() => setModalSelectedSlug(plan.plan_slug)}
              />
            );
          })}
        </BottomSheetScrollView>

        <TouchableOpacity
          onPress={handleConfirmChange}
          disabled={!modalSelectedSlug}
          className={`rounded-2xl py-5 items-center justify-center shadow-lg ${!modalSelectedSlug ? "bg-gray-800" : "bg-[#E05252]"
            }`}
        >
          <Text className="text-white font-black text-base tracking-tight">
            Continue to Checkout
          </Text>
        </TouchableOpacity>
      </AppBottomSheet>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        <View className="px-6 mb-6 mt-6">
          <Text className="text-white font-black text-3xl tracking-tight">
            {mySub?.plan_slug === "trial"
              ? "Upgrade Your Premium Plan"
              : mySub?.plan_slug
                ? "Manage Your Subscription"
                : "Level Up Your App"}
          </Text>
          <Text className="text-gray-400 text-sm mt-3 leading-6 font-medium">
            {mySub?.plan_slug === "trial"
              ? "Unlock the full power of Premium today. Choose a plan below to continue with uninterrupted access to all tools, templates, and courses."
              : mySub?.plan_slug
                ? "You are currently on a premium active tier. Below you can view other options or click to manage your active payment methods and invoices."
                : "Unlock premium features, unlimited AI access, and priority operational support to accelerate your development."}
          </Text>
        </View>

        {mySub?.plan_slug && (mySub?.status === "active" || mySub?.status === "trialing" || mySub?.status === "past_due") ? (
          <View className="mx-4 mb-6 rounded-3xl p-6 bg-[#111827] border border-gray-800 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">
                  Your Current Plan
                </Text>
                <Text className="text-white font-black text-2xl tracking-tight">
                  {mySub.plan_name || (mySub.plan_slug === "trial" ? "Free Trial" : "Premium Plan")}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor:
                    mySub.status === "active"
                      ? "#22C55E15"
                      : mySub.status === "trialing"
                        ? "#F59E0B15"
                        : "#EF444415",
                  borderColor:
                    mySub.status === "active"
                      ? "#22C55E30"
                      : mySub.status === "trialing"
                        ? "#F59E0B30"
                        : "#EF444430",
                  borderWidth: 1,
                }}
                className="px-3 py-1.5 rounded-full"
              >
                <Text
                  style={{
                    color:
                      mySub.status === "active"
                        ? "#22C55E"
                        : mySub.status === "trialing"
                          ? "#F59E0B"
                          : "#EF4444",
                  }}
                  className="text-[10px] font-black tracking-widest uppercase"
                >
                  {mySub.status === "trialing" ? "Trialing" : mySub.status || "Active"}
                </Text>
              </View>
            </View>

            <View className="space-y-3 mt-2 border-t border-gray-800/60 pt-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-400 text-xs">Billing Period End</Text>
                <Text className="text-gray-200 text-xs font-bold">
                  {formatDate(mySub.current_period_end)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400 text-xs">Renewal Status</Text>
                <Text
                  className={`text-xs font-bold ${mySub.cancel_at_period_end ? "text-amber-500" : "text-emerald-500"
                    }`}
                >
                  {mySub.cancel_at_period_end ? "Expires on end date" : "Renews automatically"}
                </Text>
              </View>
            </View>

            {mySub.plan_slug !== "trial" && (
              <TouchableOpacity
                onPress={handleManage}
                activeOpacity={0.8}
                className="mt-5 w-full bg-[#1F2937] py-4 rounded-2xl border border-gray-800/80 items-center"
              >
                <Text className="text-gray-300 font-bold text-xs uppercase tracking-widest">
                  Manage Billing
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="mx-4 mb-6 rounded-3xl p-6 bg-[#111827] border border-gray-800 shadow-xl">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">
                  Your Current Plan
                </Text>
                <Text className="text-white font-black text-2xl tracking-tight">
                  Free Trial
                </Text>
              </View>
              <View className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
                <Text className="text-gray-400 text-[10px] font-black tracking-widest uppercase">
                  FREE
                </Text>
              </View>
            </View>
            <Text className="text-gray-400 text-xs mt-3 leading-5">
              You are currently on the free version. Upgrade below to unlock complete AI access, all resources, and premium features!
            </Text>
          </View>
        )}

        {!mySub?.plan_slug || mySub?.plan_slug === "trial" ? (
          filteredPlans.map((plan) => (
            <PlanCard
              key={plan.plan_slug}
              plan={plan}
              selected={selectedPlan?.plan_slug === plan.plan_slug}
              isCurrent={mySub?.plan_slug === plan.plan_slug}
              onPress={() => setSelectedSlug(plan.plan_slug)}
            />
          ))
        ) : null}

        <View className="px-10 mt-4">
          <Text className="text-gray-600 text-[10px] font-bold text-center leading-4 uppercase tracking-widest">
            {mySub?.plan_slug === "trial"
              ? "Upgrade to Premium Tier • Fast & Secure Checkout • Cancel Anytime"
              : mySub?.plan_slug
                ? "Secured by Stripe • End-to-end Encrypted • Manage Anytime"
                : "Secured by Stripe • End-to-end Encrypted • Cancel Anytime"}
          </Text>
        </View>

      </ScrollView>

      {filteredPlans.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-6 bg-[#030712]/90 border-t border-gray-900">
          {mySub?.plan_slug && mySub?.plan_slug !== "trial" ? (
            <TouchableOpacity
              onPress={() => {
                setModalSelectedSlug(null);
                presentChangePlan();
              }}
              activeOpacity={0.8}
              className="rounded-2xl py-5 flex-row items-center justify-center bg-[#E05252] shadow-2xl"
            >
              <View className="flex-row items-center gap-3">
                <Zap size={20} color="white" fill="white" />
                <Text className="text-white font-black text-base tracking-tight">
                  Switch Plan
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isButtonDisabled}
              className={`rounded-2xl py-5 flex-row items-center justify-center shadow-2xl ${isButtonDisabled
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
                    {buttonText}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {mySub?.plan_slug === "trial" ? (
            <Text className="text-gray-500 text-[9px] text-center mt-3 font-bold uppercase tracking-widest">
              Upgrade will take effect immediately. Billed by Stripe.
            </Text>
          ) : !mySub?.plan_slug ? (
            <Text className="text-gray-500 text-[9px] text-center mt-3 font-bold uppercase tracking-widest">
              Automatic renewal until cancelled in settings.
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}