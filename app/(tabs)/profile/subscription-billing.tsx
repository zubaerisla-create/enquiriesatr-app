import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import {
  Check,
  ChevronLeft,
  Rocket,
  Star,
  Trophy,
  Zap,
  ShieldCheck
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../hooks/useAuth";
import { useStripePayment } from "../../../hooks/useStripePayment";
import { api } from "../../../lib/api";
import { AppBottomSheet } from "../../../components/ui";
import { useBottomSheet } from "../../../hooks/useBottomSheet";

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

const getCurrencySymbol = (currency: string) => {
  const code = currency?.toLowerCase();
  switch (code) {
    case "gbp":
      return "£";
    case "usd":
      return "$";
    case "eur":
      return "€";
    default:
      return "£"; // default to GBP
  }
};

const TrialCard = () => (
  <View className="bg-gray-100 rounded-2xl p-5 mb-4 border border-gray-200">
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-row items-center gap-3">
        <View className="w-5 h-5 rounded-full border border-gray-300 bg-gray-200" />
        <Text className="text-gray-500 font-black text-xl tracking-wider uppercase">Trial</Text>
      </View>
      <Text className="text-gray-400 font-black text-xl tracking-tight">Free</Text>
    </View>
    <View className="space-y-2">
      {["3 lessons", "Limited AI queries", "No operational tools"].map((text, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <Check size={14} color="#9CA3AF" strokeWidth={3} />
          <Text className="text-gray-500 text-sm font-medium">{text}</Text>
        </View>
      ))}
    </View>
  </View>
);

const MonthlyCard = ({ plan, isCurrent, onPress, onManage, loading }: { plan: Plan; isCurrent: boolean; onPress: () => void; onManage: () => void; loading: boolean }) => {
  const symbol = getCurrencySymbol(plan.currency);
  const price = ((plan.amount || 0) / 100).toFixed(2);

  return (
    <View
      className={`rounded-2xl p-5 mb-4 relative border-2 ${isCurrent ? 'border-emerald-500' : 'border-[#1E293B]'}`}
      style={{ backgroundColor: "#1C2433" }}
    >
      {isCurrent && (
        <View className="absolute -top-3 left-4 bg-emerald-500 rounded-md px-3 py-1 flex-row items-center gap-1 z-10">
          <Check size={10} color="white" strokeWidth={3} />
          <Text className="text-white text-[10px] font-black tracking-widest uppercase">Active Plan</Text>
        </View>
      )}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-3">
          <View className={`w-5 h-5 rounded-full border items-center justify-center border-gray-600`} />
          <Text className="text-white font-black text-xl tracking-wider uppercase">{plan.plan_name}</Text>
        </View>
        <View className="flex-row items-baseline">
          <Text className="text-[#3B82F6] font-black text-2xl tracking-tighter">{symbol}{price}</Text>
          <Text className="text-gray-400 text-xs font-medium ml-1">/{plan.interval}</Text>
        </View>
      </View>

      <View className="space-y-2 mb-5">
        {(plan.features || []).map((text, i) => (
          <View key={i} className="flex-row items-center gap-3">
            <Check size={14} color="#3B82F6" strokeWidth={3} />
            <Text className="text-gray-300 text-sm font-medium">{text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={isCurrent ? onManage : onPress}
        disabled={loading}
        className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${isCurrent ? 'bg-emerald-500' : 'bg-[#3B82F6]'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-bold text-sm tracking-wider text-white">
            {isCurrent ? 'Manage Subscription' : 'Choose Monthly'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const AnnualCard = ({ plan, isCurrent, onPress, onManage, loading, monthlyPriceAmount }: { plan: Plan; isCurrent: boolean; onPress: () => void; onManage: () => void; loading: boolean; monthlyPriceAmount: number }) => {
  const symbol = getCurrencySymbol(plan.currency);
  const price = ((plan.amount || 0) / 100).toFixed(2);

  const monthlyCostAnnualized = (monthlyPriceAmount / 100) * 12;
  const annualCost = (plan.amount || 0) / 100;
  const savings = monthlyCostAnnualized > annualCost ? (monthlyCostAnnualized - annualCost).toFixed(2) : null;

  return (
    <View
      className={`rounded-2xl p-5 mb-4 relative border-2 ${isCurrent ? 'border-emerald-500' : 'border-[#D83B3B]'}`}
      style={{ backgroundColor: "#FFF5F5" }}
    >
      {isCurrent ? (
        <View className="absolute -top-3 left-4 bg-emerald-500 rounded-md px-3 py-1 flex-row items-center gap-1 z-10">
          <Check size={10} color="white" strokeWidth={3} />
          <Text className="text-white text-[10px] font-black tracking-widest uppercase">Active Plan</Text>
        </View>
      ) : (
        <View className="absolute -top-3 right-4 bg-[#D83B3B] rounded-md px-3 py-1 flex-row items-center gap-1 z-10">
          <Star size={10} color="white" fill="white" />
          <Text className="text-white text-[10px] font-black tracking-widest uppercase">Recommended</Text>
        </View>
      )}

      <View className="flex-row justify-between items-center mb-4 mt-2">
        <View className="flex-row items-center gap-3">
          <View className={`w-5 h-5 rounded-full border items-center justify-center border-gray-400`} />
          <Text className="text-[#1F2937] font-black text-xl tracking-wider uppercase">{plan.plan_name}</Text>

          {savings && (
            <View className="bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
              <Text className="text-amber-700 font-bold text-[10px]">Save {symbol}{savings}</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-baseline">
          <Text className="text-[#D83B3B] font-black text-2xl tracking-tighter">{symbol}{price}</Text>
          <Text className="text-gray-500 text-xs font-medium ml-1">/{plan.interval}</Text>
        </View>
      </View>

      <View className="space-y-2 mb-5">
        {(plan.features || []).map((text, i) => (
          <View key={i} className="flex-row items-center gap-3">
            <Check size={14} color="#D83B3B" strokeWidth={3} />
            <Text className="text-gray-600 text-sm font-medium">{text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={isCurrent ? onManage : onPress}
        disabled={loading}
        className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${isCurrent ? 'bg-emerald-500' : 'bg-[#D83B3B]'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {!isCurrent && <Zap size={16} color="white" fill="white" />}
            <Text className="font-bold text-sm tracking-wider text-white">
              {isCurrent ? 'Manage Subscription' : 'Choose Annual'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};


export default function UpgradeAccess() {
  const queryClient = useQueryClient();
  const { subscribe, loading: paymentLoading } = useStripePayment();
  const [activeActionSlug, setActiveActionSlug] = useState<string | null>(null);

  const successSheet = useBottomSheet();
  const confirmSheet = useBottomSheet();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pendingUpgradeSlug, setPendingUpgradeSlug] = useState<string | null>(null);

  const handleSuccessClose = useCallback(() => {
    successSheet.dismiss();
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

  const { refreshUser } = useAuth();

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

  const monthlyPlan = useMemo(() => plans?.find(p => p.interval === "month" && p.plan_slug !== "trial"), [plans]);
  const annualPlan = useMemo(() => plans?.find(p => p.interval === "year" && p.plan_slug !== "trial"), [plans]);

  const handleConfirmUpgrade = async () => {
    if (!pendingUpgradeSlug) return;
    setIsUpgrading(true);
    try {
      await api.post("/subscriptions/plan/change/", { plan_slug: pendingUpgradeSlug }, { requireAuth: true });
      
      const newPlan = plans?.find(p => p.plan_slug === pendingUpgradeSlug);
      if (newPlan) {
        queryClient.setQueryData<MySubscription>(["my-subscription"], (old) => {
          if (!old) return old;
          return {
            ...old,
            plan_slug: newPlan.plan_slug,
            plan_name: newPlan.plan_name,
            status: "active"
          };
        });
      }

      await refreshUser();
      confirmSheet.dismiss();
      setTimeout(() => {
        successSheet.present();
      }, 500);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not change plan.");
    } finally {
      setIsUpgrading(false);
      setPendingUpgradeSlug(null);
    }
  };

  const handleContinue = async (planSlug: string) => {
    if (mySub?.plan_slug && mySub?.plan_slug === planSlug) {
      Alert.alert("Already Subscribed", "You are already on this plan.");
      return;
    }

    if (mySub?.plan_slug && mySub?.plan_slug !== "trial" && planSlug !== mySub.plan_slug) {
      setPendingUpgradeSlug(planSlug);
      confirmSheet.present();
      return;
    }

    setActiveActionSlug(planSlug);
    await subscribe(planSlug, async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      await refreshUser();
      successSheet.present();
    });
    setActiveActionSlug(null);
  };

  if (plansLoading || mySubLoading) {
    return (
      <View className="flex-1 bg-[#111827] items-center justify-center">
        <ActivityIndicator size="large" color="#D83B3B" />
      </View>
    );
  }

  const isCurrentActivePlan = mySub?.plan_slug && mySub?.plan_slug !== "trial";

  return (
    <View className="flex-1 bg-[#111827]">
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Success Bottom Sheet */}
      <AppBottomSheet
        ref={successSheet.ref}
        enableDynamicSizing={true}
        showCloseButton={false}
        onDismiss={() => {
          if (successSheet.isOpen) handleSuccessClose();
        }}
      >
        <View className="items-center mb-8 pt-6">
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

        <TouchableOpacity
          onPress={handleSuccessClose}
          className="bg-white w-full py-5 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-black font-black text-lg tracking-tight">Start Exploring</Text>
        </TouchableOpacity>
      </AppBottomSheet>

      {/* Confirm Upgrade Bottom Sheet */}
      <AppBottomSheet
        ref={confirmSheet.ref}
        enableDynamicSizing={true}
        showCloseButton={false}
      >
        <View className="items-center mb-8 w-full pt-4">
          <View className="w-20 h-20 bg-[#D83B3B]/10 rounded-full items-center justify-center mb-5 border border-[#D83B3B]/20 shadow-2xl">
            <Rocket size={40} color="#D83B3B" />
          </View>
          <Text className="text-white font-black text-2xl text-center tracking-tighter mb-2">
            Confirm Plan Change
          </Text>
          <Text className="text-gray-400 text-sm text-center font-medium px-4">
            Are you sure you want to switch to the {pendingUpgradeSlug === 'annual' ? 'Annual' : 'Monthly'} plan?
          </Text>
        </View>

        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={handleConfirmUpgrade}
            disabled={isUpgrading}
            className="bg-[#D83B3B] w-full py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg"
          >
            {isUpgrading ?
              <ActivityIndicator color="white" />
              :
              <Text className="text-white font-black text-lg tracking-tight">Yes, Switch Plan</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => confirmSheet.dismiss()}
            disabled={isUpgrading}
            className="bg-transparent border border-gray-700 w-full py-4 rounded-2xl items-center"
          >
            <Text className="text-gray-300 font-bold text-lg tracking-tight">Cancel</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

      {/* Fixed Header */}
      <View className="px-6 pt-16 pb-8 bg-[#111827] z-10">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
          <ChevronLeft size={20} color="#9CA3AF" />
          <Text className="text-gray-400 font-medium ml-1">Back</Text>
        </TouchableOpacity>

        <Text className="text-white font-black text-3xl tracking-wider uppercase mb-3">
          Upgrade Your Access
        </Text>
        <Text className="text-gray-400 text-sm leading-5">
          Full access to all 30 lessons, unlimited AI queries, and all operational tools.
        </Text>


      </View>

      <ScrollView
        className="flex-1 bg-[#111827]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* White container for plans */}
        <View className="bg-white rounded-t-3xl px-4 pt-8 pb-12 flex-1">
          {!isCurrentActivePlan && <TrialCard />}

          {monthlyPlan && (
            <MonthlyCard
              plan={monthlyPlan}
              isCurrent={mySub?.plan_slug === monthlyPlan.plan_slug}
              onPress={() => handleContinue(monthlyPlan.plan_slug)}
              onManage={handleManage}
              loading={paymentLoading && activeActionSlug === monthlyPlan.plan_slug}
            />
          )}

          {annualPlan && (
            <AnnualCard
              plan={annualPlan}
              isCurrent={mySub?.plan_slug === annualPlan.plan_slug}
              onPress={() => handleContinue(annualPlan.plan_slug)}
              onManage={handleManage}
              loading={paymentLoading && activeActionSlug === annualPlan.plan_slug}
              monthlyPriceAmount={monthlyPlan?.amount || 0}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}