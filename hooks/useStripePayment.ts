import { useState } from "react";
import { useStripe, Constants } from "@stripe/stripe-react-native";
import { Alert } from "react-native";
import { api } from "../lib/api";

interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async (planSlug: string) => {
    const response = await api.post<PaymentSheetParams>(
      "/subscriptions/payment-sheet/",
      {
        plan_slug: planSlug,
        stripe_version: Constants.API_VERSIONS.CORE,
      },
      { requireAuth: true }
    );
    return response.data;
  };


  const subscribe = async (planSlug: string, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = await fetchPaymentSheetParams(planSlug);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "RN-Wind",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") {
        } else {
          Alert.alert("Error", presentError.message);
        }
      } else {
        Alert.alert("Success", "Your subscription is confirmed!");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    subscribe,
    loading,
  };
}
