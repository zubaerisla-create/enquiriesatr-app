import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../contexts/AuthContext";
import "../global.css";
import { useAuth } from "../hooks/useAuth";
import { usePushNotifications } from "../hooks/usePushNotifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

function PushNotificationsListener() {
  usePushNotifications();
  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {

  const { accessToken, isBootstrapping } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const current = String(segments[0] ?? "");
    const isAuthRoute = current === "(auth)";
    const isRootRoute = pathname === "/";
    const isOnboardingRoute = current === "(onboarding)" || isRootRoute;

    if (!accessToken && !isAuthRoute && !isOnboardingRoute) {
      router.replace("/(auth)/login");
    }

    if (accessToken && isAuthRoute) {
      router.replace("/(tabs)");
    }
  }, [accessToken, isBootstrapping, pathname, router, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StripeProvider
              publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
              merchantIdentifier="merchant.com.rnwind"
            >
              <AuthProvider>
                <PushNotificationsListener />
                <AuthGate>

                  <Stack screenOptions={{
                    headerShown: false,
                    animation: 'none',
                    contentStyle: { backgroundColor: 'transparent' },
                  }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(onboarding)/index" />
                    <Stack.Screen name="(auth)/login" />
                    <Stack.Screen name="(auth)/signup" />
                    <Stack.Screen name="(auth)/verify" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)/forgot-password" />
                    <Stack.Screen name="tool-details" />
                    <Stack.Screen name="tool-complete" />
                    <Stack.Screen name="search-operations" />
                    <Stack.Screen name="module-details" />
                    <Stack.Screen name="lesson" />
                    <Stack.Screen name="threat-assessment-intro" />
                    <Stack.Screen name="threat-assessment-checklist" />
                    <Stack.Screen name="risk-report" />
                    <Stack.Screen name="assessment" />
                    <Stack.Screen name="document-details" />
                    <Stack.Screen name="venue-security-rag" />
                    <Stack.Screen name="travel-security-scrim" />
                  </Stack>
                </AuthGate>
              </AuthProvider>
              <Toast />
            </StripeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
