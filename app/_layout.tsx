import React, { useEffect } from "react";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

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
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
          merchantIdentifier="merchant.com.rnwind"
        >
          <AuthProvider>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(onboarding)/index" />
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="(auth)/signup" />
                <Stack.Screen name="(auth)/verify" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)/forgot-password" />
                {/* Tools */}
                <Stack.Screen name="tool-details" />
                <Stack.Screen name="tool-complete" />
                {/* Learn */}
                <Stack.Screen name="module-details" />
                <Stack.Screen name="lesson" />
                <Stack.Screen name="threat-assessment-details" />
                <Stack.Screen name="threat-assessment-intro" />
                <Stack.Screen name="threat-assessment-checklist" />
                <Stack.Screen name="risk-report" />
                {/* Assessment */}
                <Stack.Screen name="assessment" />
              </Stack>
            </AuthGate>
          </AuthProvider>
        </StripeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
