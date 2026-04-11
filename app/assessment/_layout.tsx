import { Stack } from "expo-router";

export default function AssessmentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
