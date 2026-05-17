import { useState } from "react";
import { useStripe, Constants } from "@stripe/stripe-react-native";
import { Alert } from "react-native";
import { api } from "../lib/api";

interface PaymentSheetParams {
  paymentIntent: string;
  customerSessionClientSecret: string;
  customer: string;
  publishableKey: string;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async (planSlug: string) => {
    const response = await api.post<PaymentSheetParams>(
      "/subscriptions/payment-sheet/",
      {
        plan_slug: planSlug,
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
        customerSessionClientSecret,
        customer,
      } = await fetchPaymentSheetParams(planSlug);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Enquiries App",
        customerId: customer,
        customerSessionClientSecret: customerSessionClientSecret,
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
