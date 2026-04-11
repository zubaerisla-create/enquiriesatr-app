import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)/index" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/signup" />
      <Stack.Screen name="(auth)/verify" />
      <Stack.Screen name="(tabs)" />
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
  );
}
